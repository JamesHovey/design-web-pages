"use client";

import { useState } from "react";

export interface GlobalHeaderConfig {
  siteLogo: boolean;
  mainMenu: boolean;
  menuItems: string[];
  search: boolean;
  searchType: "icon" | "input-box";
  iconBox: boolean;
  iconBoxIcon: string;
  iconBoxPhone: string;
  cartIcon: boolean;
}

interface GlobalHeaderSelectorProps {
  value: GlobalHeaderConfig;
  onChange: (value: GlobalHeaderConfig) => void;
  siteType?: string;
}

export default function GlobalHeaderSelector({
  value,
  onChange,
  siteType,
}: GlobalHeaderSelectorProps) {
  const handleToggle = (field: keyof GlobalHeaderConfig) => {
    onChange({
      ...value,
      [field]: !value[field],
    });
  };

  const handleMenuItemChange = (index: number, newValue: string) => {
    const newMenuItems = [...value.menuItems];
    newMenuItems[index] = newValue;
    onChange({
      ...value,
      menuItems: newMenuItems,
    });
  };

  const addMenuItem = () => {
    onChange({
      ...value,
      menuItems: [...value.menuItems, "New Item"],
    });
  };

  const removeMenuItem = (index: number) => {
    const newMenuItems = value.menuItems.filter((_, i) => i !== index);
    onChange({
      ...value,
      menuItems: newMenuItems,
    });
  };

  return (
    <div className="space-y-6">
      {/* Site Logo */}
      <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
        <input
          type="checkbox"
          id="siteLogo"
          checked={value.siteLogo}
          onChange={() => handleToggle("siteLogo")}
          className="mt-1 w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
        />
        <div className="flex-1">
          <label htmlFor="siteLogo" className="font-medium text-gray-900 cursor-pointer">
            Site Logo
          </label>
          <p className="text-sm text-gray-600 mt-1">
            Display the site logo in the header
          </p>
        </div>
      </div>

      {/* Main Menu */}
      <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
        <input
          type="checkbox"
          id="mainMenu"
          checked={value.mainMenu}
          onChange={() => handleToggle("mainMenu")}
          className="mt-1 w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
        />
        <div className="flex-1">
          <label htmlFor="mainMenu" className="font-medium text-gray-900 cursor-pointer">
            Main Menu
          </label>
          <p className="text-sm text-gray-600 mt-1 mb-3">
            Navigation menu with customizable items
          </p>

          {value.mainMenu && (
            <div className="space-y-2 mt-3">
              <p className="text-sm font-medium text-gray-700">Menu Items:</p>
              {value.menuItems.map((item, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="text"
                    value={item}
                    onChange={(e) => handleMenuItemChange(index, e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    placeholder={`Menu item ${index + 1}`}
                  />
                  {value.menuItems.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeMenuItem(index)}
                      className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg text-sm font-medium"
                    >
                      Remove
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={addMenuItem}
                className="px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg text-sm font-medium"
              >
                + Add Menu Item
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Search */}
      <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
        <input
          type="checkbox"
          id="search"
          checked={value.search}
          onChange={() => handleToggle("search")}
          className="mt-1 w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
        />
        <div className="flex-1">
          <label htmlFor="search" className="font-medium text-gray-900 cursor-pointer">
            Search
          </label>
          <p className="text-sm text-gray-600 mt-1 mb-3">
            Add search functionality to the header
          </p>

          {value.search && (
            <div className="space-y-2 mt-3">
              <p className="text-sm font-medium text-gray-700">Search Type:</p>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="searchType"
                    value="icon"
                    checked={value.searchType === "icon"}
                    onChange={(e) => onChange({ ...value, searchType: "icon" })}
                    className="w-4 h-4 text-blue-600"
                  />
                  <span className="text-sm text-gray-700">Icon Only</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="searchType"
                    value="input-box"
                    checked={value.searchType === "input-box"}
                    onChange={(e) => onChange({ ...value, searchType: "input-box" })}
                    className="w-4 h-4 text-blue-600"
                  />
                  <span className="text-sm text-gray-700">Input Box with Icon</span>
                </label>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Icon Box (Contact) */}
      <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
        <input
          type="checkbox"
          id="iconBox"
          checked={value.iconBox}
          onChange={() => handleToggle("iconBox")}
          className="mt-1 w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
        />
        <div className="flex-1">
          <label htmlFor="iconBox" className="font-medium text-gray-900 cursor-pointer">
            Icon Box (Contact)
          </label>
          <p className="text-sm text-gray-600 mt-1 mb-3">
            Display contact information with an icon
          </p>

          {value.iconBox && (
            <div className="space-y-3 mt-3">
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">
                  Icon Type:
                </label>
                <select
                  value={value.iconBoxIcon}
                  onChange={(e) => onChange({ ...value, iconBoxIcon: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                >
                  <option value="phone">Phone</option>
                  <option value="email">Email</option>
                  <option value="location">Location</option>
                  <option value="chat">Chat</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">
                  Contact Information:
                </label>
                <input
                  type="text"
                  value={value.iconBoxPhone}
                  onChange={(e) => onChange({ ...value, iconBoxPhone: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  placeholder="e.g., +1 (555) 123-4567"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Cart Icon */}
      <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
        <input
          type="checkbox"
          id="cartIcon"
          checked={value.cartIcon}
          onChange={() => handleToggle("cartIcon")}
          className="mt-1 w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
        />
        <div className="flex-1">
          <label htmlFor="cartIcon" className="font-medium text-gray-900 cursor-pointer">
            Cart Icon
          </label>
          <p className="text-sm text-gray-600 mt-1">
            Display shopping cart icon (recommended for ecommerce sites)
          </p>
          {siteType === "ecommerce" && (
            <p className="text-sm text-blue-600 mt-2">
              ✓ Recommended for {siteType} sites
            </p>
          )}
        </div>
      </div>

      {/* AI Intelligence Note */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex gap-3">
          <svg
            className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <div>
            <h4 className="font-medium text-blue-900 text-sm mb-1">AI-Powered Selection</h4>
            <p className="text-sm text-blue-800">
              The AI will intelligently choose which widgets to include based on your site type,
              industry, and design variation. These checkboxes indicate available options.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
