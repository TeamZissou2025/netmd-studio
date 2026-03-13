export interface NetMDDeviceEntry {
  vendorId: number;
  productId: number;
  name: string;
  manufacturer: string;
  modelNumber: string;
  isHiMD: boolean;
}

export const NETMD_DEVICE_REGISTRY: NetMDDeviceEntry[] = [
  // Sony Net MD portables
  { vendorId: 0x054c, productId: 0x0034, name: 'MZ-N1', manufacturer: 'Sony', modelNumber: 'MZ-N1', isHiMD: false },
  { vendorId: 0x054c, productId: 0x0036, name: 'MZ-N1', manufacturer: 'Sony', modelNumber: 'MZ-N1', isHiMD: false },
  { vendorId: 0x054c, productId: 0x0075, name: 'MZ-N1', manufacturer: 'Sony', modelNumber: 'MZ-N1', isHiMD: false },
  { vendorId: 0x054c, productId: 0x007c, name: 'LAM-1', manufacturer: 'Sony', modelNumber: 'LAM-1', isHiMD: false },
  { vendorId: 0x054c, productId: 0x0080, name: 'LAM-3', manufacturer: 'Sony', modelNumber: 'LAM-3', isHiMD: false },
  { vendorId: 0x054c, productId: 0x0081, name: 'MDS-JE780/JB980/NT1', manufacturer: 'Sony', modelNumber: 'MDS-JE780', isHiMD: false },
  { vendorId: 0x054c, productId: 0x0084, name: 'MZ-N505', manufacturer: 'Sony', modelNumber: 'MZ-N505', isHiMD: false },
  { vendorId: 0x054c, productId: 0x0085, name: 'MZ-S1', manufacturer: 'Sony', modelNumber: 'MZ-S1', isHiMD: false },
  { vendorId: 0x054c, productId: 0x0086, name: 'MZ-N707', manufacturer: 'Sony', modelNumber: 'MZ-N707', isHiMD: false },
  { vendorId: 0x054c, productId: 0x008e, name: 'CMT-C7NT', manufacturer: 'Sony', modelNumber: 'CMT-C7NT', isHiMD: false },
  { vendorId: 0x054c, productId: 0x0097, name: 'PCGA-MDN1', manufacturer: 'Sony', modelNumber: 'PCGA-MDN1', isHiMD: false },
  { vendorId: 0x054c, productId: 0x00ad, name: 'CMT-L7HD', manufacturer: 'Sony', modelNumber: 'CMT-L7HD', isHiMD: false },
  { vendorId: 0x054c, productId: 0x00c6, name: 'MZ-N10', manufacturer: 'Sony', modelNumber: 'MZ-N10', isHiMD: false },
  { vendorId: 0x054c, productId: 0x00c7, name: 'MZ-N910', manufacturer: 'Sony', modelNumber: 'MZ-N910', isHiMD: false },
  { vendorId: 0x054c, productId: 0x00c8, name: 'MZ-N710/NF810', manufacturer: 'Sony', modelNumber: 'MZ-N710', isHiMD: false },
  { vendorId: 0x054c, productId: 0x00c9, name: 'MZ-N510/N610', manufacturer: 'Sony', modelNumber: 'MZ-N510', isHiMD: false },
  { vendorId: 0x054c, productId: 0x00ca, name: 'MZ-NE410/NF520D', manufacturer: 'Sony', modelNumber: 'MZ-NE410', isHiMD: false },
  { vendorId: 0x054c, productId: 0x00e7, name: 'CMT-M333NT/M373NT', manufacturer: 'Sony', modelNumber: 'CMT-M333NT', isHiMD: false },
  { vendorId: 0x054c, productId: 0x00eb, name: 'MZ-NE810/NE910', manufacturer: 'Sony', modelNumber: 'MZ-NE810', isHiMD: false },
  { vendorId: 0x054c, productId: 0x0101, name: 'LAM-10', manufacturer: 'Sony', modelNumber: 'LAM-10', isHiMD: false },
  { vendorId: 0x054c, productId: 0x0113, name: 'MDS-S500', manufacturer: 'Sony', modelNumber: 'MDS-S500', isHiMD: false },
  // Sony Hi-MD
  { vendorId: 0x054c, productId: 0x0186, name: 'MZ-NH600/NH600D', manufacturer: 'Sony', modelNumber: 'MZ-NH600', isHiMD: true },
  { vendorId: 0x054c, productId: 0x0187, name: 'MZ-NH700', manufacturer: 'Sony', modelNumber: 'MZ-NH700', isHiMD: true },
  { vendorId: 0x054c, productId: 0x0188, name: 'MZ-NH800', manufacturer: 'Sony', modelNumber: 'MZ-NH800', isHiMD: true },
  { vendorId: 0x054c, productId: 0x018a, name: 'MZ-NH900', manufacturer: 'Sony', modelNumber: 'MZ-NH900', isHiMD: true },
  { vendorId: 0x054c, productId: 0x0219, name: 'MZ-NH1', manufacturer: 'Sony', modelNumber: 'MZ-NH1', isHiMD: true },
  { vendorId: 0x054c, productId: 0x021b, name: 'MZ-NH3D', manufacturer: 'Sony', modelNumber: 'MZ-NH3D', isHiMD: true },
  { vendorId: 0x054c, productId: 0x022c, name: 'MZ-RH10', manufacturer: 'Sony', modelNumber: 'MZ-RH10', isHiMD: true },
  { vendorId: 0x054c, productId: 0x023c, name: 'MZ-RH910', manufacturer: 'Sony', modelNumber: 'MZ-RH910', isHiMD: true },
  { vendorId: 0x054c, productId: 0x0286, name: 'MZ-RH1/M200', manufacturer: 'Sony', modelNumber: 'MZ-RH1', isHiMD: true },
  { vendorId: 0x054c, productId: 0x0287, name: 'MDS-JE480', manufacturer: 'Sony', modelNumber: 'MDS-JE480', isHiMD: true },
  // Aiwa
  { vendorId: 0x054c, productId: 0x014c, name: 'AM-NX1', manufacturer: 'Aiwa', modelNumber: 'AM-NX1', isHiMD: false },
  { vendorId: 0x054c, productId: 0x017e, name: 'AM-NX9', manufacturer: 'Aiwa', modelNumber: 'AM-NX9', isHiMD: false },
  // Sharp
  { vendorId: 0x04dd, productId: 0x7202, name: 'IM-MT880H/MT899H', manufacturer: 'Sharp', modelNumber: 'IM-MT880H', isHiMD: false },
  { vendorId: 0x04dd, productId: 0x9013, name: 'IM-DR400/DR410', manufacturer: 'Sharp', modelNumber: 'IM-DR400', isHiMD: false },
  { vendorId: 0x04dd, productId: 0x9014, name: 'IM-DR80/DR420/DR580', manufacturer: 'Sharp', modelNumber: 'IM-DR80', isHiMD: false },
  // Kenwood
  { vendorId: 0x0b28, productId: 0x1004, name: 'MDX-J9', manufacturer: 'Kenwood', modelNumber: 'MDX-J9', isHiMD: false },
  // Panasonic
  { vendorId: 0x04da, productId: 0x23b3, name: 'SJ-MR250', manufacturer: 'Panasonic', modelNumber: 'SJ-MR250', isHiMD: false },
  { vendorId: 0x04da, productId: 0x23b6, name: 'SJ-MR270', manufacturer: 'Panasonic', modelNumber: 'SJ-MR270', isHiMD: false },
];

export const NETMD_DEVICE_FILTERS: USBDeviceFilter[] = NETMD_DEVICE_REGISTRY.map(
  ({ vendorId, productId }) => ({ vendorId, productId })
);

export function identifyDevice(vendorId: number, productId: number): NetMDDeviceEntry | undefined {
  return NETMD_DEVICE_REGISTRY.find(
    (d) => d.vendorId === vendorId && d.productId === productId
  );
}
