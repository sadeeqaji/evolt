// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title VoltEscrow
 * @notice Escrow for VoltPay: accepts vUSD (HTS) deposits, releases iTokens (HTS),
 *         and records/settles investments. Designed for Hedera (HSCS).
 */
interface IHederaTokenService {
    function transferToken(address token, address sender, address recipient, int64 amount) external returns (int64);
}

contract VoltEscrow {
    /*//////////////////////////////////////////////////////////////
                                 STATE
    //////////////////////////////////////////////////////////////*/

    address public owner;              // Admin / Treasury
    address public vusdToken;          // vUSD (HTS)
    address public constant HTS = address(0x167); // Hedera Token Service precompile

    struct Investment {
        address investor;
        address iToken;
        uint256 vusdAmount;
        uint256 timestamp;
        bool settled;
    }

    mapping(address => Investment[]) private _investments;

    /*//////////////////////////////////////////////////////////////
                                 EVENTS
    //////////////////////////////////////////////////////////////*/

    event VUSDDeposited(address indexed investor, uint256 amount);
    event ITokenReleased(address indexed investor, address indexed iToken, uint256 amount);
    event InvestmentRecorded(address indexed investor, address indexed iToken, uint256 vusdAmount, uint256 time);
    event Settled(address indexed investor, uint256 yieldAmount, uint256 time);
    event OwnerUpdated(address indexed oldOwner, address indexed newOwner);
    event VusdTokenUpdated(address indexed oldToken, address indexed newToken);
    event TokenAssociated(address indexed token);
    event VusdAssociated(address indexed vusd);

    /*//////////////////////////////////////////////////////////////
                                 ERRORS
    //////////////////////////////////////////////////////////////*/

    error NotAuthorized();
    error InvalidAddress();
    error InvalidAmount();
    error OutOfRange();
    error HtsTransferFailed(); // generic error (we also use require messages for rc)

    /*//////////////////////////////////////////////////////////////
                               CONSTRUCTOR
    //////////////////////////////////////////////////////////////*/

    constructor() {
        owner = msg.sender;
    }

    /*//////////////////////////////////////////////////////////////
                              MODIFIERS
    //////////////////////////////////////////////////////////////*/

    modifier onlyOwner() {
        if (msg.sender != owner) revert NotAuthorized();
        _;
    }

    /*//////////////////////////////////////////////////////////////
                             VIEW HELPERS
    //////////////////////////////////////////////////////////////*/

    function getInvestments(address investor) external view returns (Investment[] memory) {
        return _investments[investor];
    }

    function investmentsLength(address investor) external view returns (uint256) {
        return _investments[investor].length;
    }

    /*//////////////////////////////////////////////////////////////
                            INTERNAL HELPERS
    //////////////////////////////////////////////////////////////*/

    /// @dev Perform an HTS token transfer and REQUIRE rc == SUCCESS (22).
    function _htsTransfer(address token, address sender, address recipient, int64 amount) internal {
        (bool ok, bytes memory ret) = HTS.call(
            abi.encodeWithSignature(
                "transferToken(address,address,address,int64)",
                token, sender, recipient, amount
            )
        );
        require(ok, "hts transfer call failed");
        if (ret.length >= 32) {
            int64 rc = abi.decode(ret, (int64));
            require(rc == 22, "hts transfer rc != SUCCESS"); // 22 = SUCCESS
        } else {
            // Some node versions may not return a payload on success; keep a generic safety.
            revert HtsTransferFailed();
        }
    }

    function _toInt64(uint256 amount) internal pure returns (int64) {
        if (amount > 9_223_372_036_854_775_807) revert OutOfRange();
        return int64(int256(amount));
    }

    /*//////////////////////////////////////////////////////////////
                               CORE LOGIC
    //////////////////////////////////////////////////////////////*/

    function depositVUSD(uint256 amount) external {
        if (amount == 0) revert InvalidAmount();
        _htsTransfer(vusdToken, msg.sender, address(this), _toInt64(amount));
        emit VUSDDeposited(msg.sender, amount);
    }

    function releaseIToken(address investor, address iToken, uint256 amount) external onlyOwner {
        if (investor == address(0) || iToken == address(0)) revert InvalidAddress();
        if (amount == 0) revert InvalidAmount();

        _htsTransfer(iToken, address(this), investor, _toInt64(amount));
        emit ITokenReleased(investor, iToken, amount);
    }

    function recordInvestment(address investor, address iToken, uint256 vusdAmount) external onlyOwner {
        if (investor == address(0) || iToken == address(0)) revert InvalidAddress();
        if (vusdAmount == 0) revert InvalidAmount();

        _investments[investor].push(
            Investment({
                investor: investor,
                iToken: iToken,
                vusdAmount: vusdAmount,
                timestamp: block.timestamp,
                settled: false
            })
        );

        emit InvestmentRecorded(investor, iToken, vusdAmount, block.timestamp);
    }

    function settleInvestment(address investor, uint256 index, uint256 yieldAmount) external onlyOwner {
        if (index >= _investments[investor].length) revert InvalidAmount();
        Investment storage inv = _investments[investor][index];
        if (inv.settled) revert InvalidAmount();

        inv.settled = true;

        if (yieldAmount > 0) {
            _htsTransfer(vusdToken, address(this), investor, _toInt64(yieldAmount));
        }

        emit Settled(investor, yieldAmount, block.timestamp);
    }

    /*//////////////////////////////////////////////////////////////
                           ADMIN / MAINTENANCE
    //////////////////////////////////////////////////////////////*/

    function updateOwner(address newOwner) external onlyOwner {
        if (newOwner == address(0)) revert InvalidAddress();
        emit OwnerUpdated(owner, newOwner);
        owner = newOwner;
    }

    function updateVusdToken(address newVusd) external onlyOwner {
        if (newVusd == address(0)) revert InvalidAddress();
        emit VusdTokenUpdated(vusdToken, newVusd);
        vusdToken = newVusd;
    }

    /**
     * @dev Associate this contract with any HTS token.
     */
    function associateWithToken(address token) external onlyOwner {
        require(token != address(0), "Invalid token");
        (bool ok, bytes memory ret) = HTS.call(
            abi.encodeWithSignature("associateToken(address,address)", address(this), token)
        );
        require(ok, "associate call failed");

        if (ret.length >= 32) {
            int64 rc = abi.decode(ret, (int64));
            require(rc == 22, "associate rc != SUCCESS");
        }

        emit TokenAssociated(token);
    }

    /**
     * @dev Associate this contract specifically with the configured vUSD token.
     */
    function associateVusd() external onlyOwner {
        require(vusdToken != address(0), "vUSD not set");
        (bool ok, bytes memory ret) = HTS.call(
            abi.encodeWithSignature("associateToken(address,address)", address(this), vusdToken)
        );
        require(ok, "associate vUSD failed");

        if (ret.length >= 32) {
            int64 rc = abi.decode(ret, (int64));
            require(rc == 22, "associate rc != SUCCESS");
        }

        emit VusdAssociated(vusdToken);
    }
}