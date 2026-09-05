import React from 'react';
import { ButtonsRegistry } from './registry/ButtonsRegistry';
import { InputsRegistry } from './registry/InputsRegistry';
import { FormsRegistry } from './registry/FormsRegistry';
import { CardsRegistry } from './registry/CardsRegistry';
import { NavigationRegistry } from './registry/NavigationRegistry';
import { BannersRegistry } from './registry/BannersRegistry';
import { BadgesRegistry } from './registry/BadgesRegistry';
import { IndicatorsRegistry } from './registry/IndicatorsRegistry';
import { AdminRegistry } from './registry/AdminRegistry';
import { VendorRegistry } from './registry/VendorRegistry';
import { MenuButtonsRegistry } from './registry/MenuButtonsRegistry';
import { ShopRegistry } from './registry/ShopRegistry';

export interface ComponentItem {
  id: string;
  label: string;
  category: string;
  description: string;
  preview: React.ReactNode;
}

export const COMPONENT_CATEGORIES = [
  'Buttons',
  'Inputs',
  'Forms',
  'Cards',
  'Navigation',
  'Banners',
  'Badges',
  'Indicators',
  'Admin Widgets',
  'Vendor',
  'Menu Items',
] as const;

export const COMPONENT_REGISTRY: ComponentItem[] = [
  ...ButtonsRegistry,
  ...InputsRegistry,
  ...FormsRegistry,
  ...CardsRegistry,
  ...NavigationRegistry,
  ...BannersRegistry,
  ...BadgesRegistry,
  ...IndicatorsRegistry,
  ...AdminRegistry,
  ...VendorRegistry,
  ...MenuButtonsRegistry,
  ...ShopRegistry,
];
