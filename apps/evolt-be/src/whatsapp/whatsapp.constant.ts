export const KYC_FLOW_MESSAGE = (to: string) => ({
    messaging_product: 'whatsapp',
    to,
    type: 'interactive',
    interactive: {
        type: 'flow',
        header: {
            type: 'text',
            text: 'Welcome to Halal Credit! 🌟',
        },
        body: {
            text: 'Get access to Shariah - compliant financing with ease. No interest, no hidden fees, just ethical financial solutions for you. Tap the button below to get started!',
        },
        footer: {
            text: 'Click the button below to proceed',
        },
        action: {
            name: 'flow',
            parameters: {
                flow_id: '2954602864703606',
                flow_message_version: '3',
                flow_token: 'kyc',
                flow_cta: 'Get Started',
                flow_action: 'navigate',
                flow_action_payload: {
                    screen: 'ENTER_BVN',
                    data: {
                        phone_number: to,
                    },
                },
            },
        },
    },
});