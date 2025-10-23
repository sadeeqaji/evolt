"use client";
import React, { useState } from "react";
import Link from "next/link";
import { type LucideIcon } from "lucide-react";

type TabLink = {
  id: string;
  label: string;
  icon: LucideIcon;
  type: "link";
  href: string;
  content?: React.ReactNode;
};

type TabContent = {
  id: string;
  label: string;
  icon: LucideIcon;
  type: "tab";
  content: React.ReactNode;
};

export type TabConfig = TabLink | TabContent;

type HybridTabsProps = {
  tabs: TabConfig[];
  defaultTabId?: string;
};

const AssetTabs: React.FC<HybridTabsProps> = ({ tabs, defaultTabId }) => {
  const initialTabId =
    defaultTabId || tabs.find((tab) => tab.type === "tab")?.id || null;
  const [activeTabId, setActiveTabId] = useState<string | null>(initialTabId);

  const activeTabData = tabs.find(
    (tab) => tab.type === "tab" && tab.id === activeTabId
  );

  return (
    <div className="flex items-center justify-center w-full">
      <div className="w-full">
        <div className="bg-black rounded-full p-2 shadow-2xl border border-slate-800">
          <div className="flex items-center gap-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = tab.type === "tab" && activeTabId === tab.id;

              const commonClasses = `
                flex items-center gap-3 px-1 py-1.5 lg:px-6 lg:py-3.5 rounded-full
                font-medium text-xs lg:text-base transition-all duration-300 ease-in-out
                flex-1 justify-center outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-black focus:ring-indigo-500
              `;
              const activeClasses =
                "bg-gradient-to-r from-indigo-500 to-blue-500 text-white shadow-lg shadow-indigo-500/50 scale-105";
              const inactiveClasses =
                "text-gray-500 hover:text-gray-300 hover:bg-slate-900/50";
              const iconClasses = `lg:w-5 lg:h-5 w-3 h-3 transition-transform duration-300 ${
                isActive ? "scale-110" : ""
              }`;

              if (tab.type === "link") {
                return (
                  <Link
                    key={tab.id}
                    href={tab.href}
                    className={`${commonClasses} ${inactiveClasses}`}
                  >
                    <Icon className={iconClasses} />
                    <span>{tab.label}</span>
                  </Link>
                );
              }

              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTabId(tab.id)}
                  className={`${commonClasses} ${
                    isActive ? activeClasses : inactiveClasses
                  }`}
                >
                  <Icon className={iconClasses} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {activeTabData && (
          <div className="mt-8 transition-opacity duration-500 ease-in-out">
            {activeTabData.content}
          </div>
        )}
      </div>
    </div>
  );
};

export default AssetTabs;
