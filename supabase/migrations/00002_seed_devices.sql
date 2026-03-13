-- ============================================================
-- 00002_seed_devices.sql
-- NetMD Studio: Seed data for Device Library
-- All known Net MD and Hi-MD devices from the WebUSB filter registry
-- ============================================================

-- ---------- Sony Net MD Portables ----------

-- MZ-N1 (Rev.1) — PID 0x0034
INSERT INTO public.devices (
  id, name, manufacturer, model_number, device_type,
  usb_vid, usb_pid, year_released, year_discontinued,
  atrac_version, has_mdlp, has_himd, has_type_s,
  has_optical_in, has_optical_out, has_line_in, has_line_out,
  has_mic_in, has_usb, has_recording,
  usb_speed, transfer_speed, battery_type, display_type, weight_grams,
  description, notes,
  netmd_js_compatible, webusb_filter, submitted_by, verified
) VALUES (
  uuid_generate_v4(),
  'Sony MZ-N1', 'Sony', 'MZ-N1', 'portable_netmd',
  '054c', '0034', 2001, 2003,
  'v3', TRUE, FALSE, FALSE,
  TRUE, FALSE, TRUE, TRUE,
  TRUE, TRUE, TRUE,
  '1.1', NULL, 'LIP-4WM gumstick', 'LCD', 100,
  'Sony''s first Net MD portable recorder. Features optical digital input, MDLP support, and USB connectivity for PC transfers.',
  'First firmware revision. One of the first Net MD devices released.',
  TRUE, '{"vendorId": 1356, "productId": 52}'::jsonb, NULL, TRUE
);

-- MZ-N1 (Rev.2) — PID 0x0036
INSERT INTO public.devices (
  id, name, manufacturer, model_number, device_type,
  usb_vid, usb_pid, year_released, year_discontinued,
  atrac_version, has_mdlp, has_himd, has_type_s,
  has_optical_in, has_optical_out, has_line_in, has_line_out,
  has_mic_in, has_usb, has_recording,
  usb_speed, transfer_speed, battery_type, display_type, weight_grams,
  description, notes,
  netmd_js_compatible, webusb_filter, submitted_by, verified
) VALUES (
  uuid_generate_v4(),
  'Sony MZ-N1 (Rev.2)', 'Sony', 'MZ-N1', 'portable_netmd',
  '054c', '0036', 2001, 2003,
  'v3', TRUE, FALSE, FALSE,
  TRUE, FALSE, TRUE, TRUE,
  TRUE, TRUE, TRUE,
  '1.1', NULL, 'LIP-4WM gumstick', 'LCD', 100,
  'Sony''s first Net MD portable recorder. Features optical digital input, MDLP support, and USB connectivity for PC transfers.',
  'Second firmware revision with updated USB product ID.',
  TRUE, '{"vendorId": 1356, "productId": 54}'::jsonb, NULL, TRUE
);

-- MZ-N1 (Rev.3) — PID 0x0075
INSERT INTO public.devices (
  id, name, manufacturer, model_number, device_type,
  usb_vid, usb_pid, year_released, year_discontinued,
  atrac_version, has_mdlp, has_himd, has_type_s,
  has_optical_in, has_optical_out, has_line_in, has_line_out,
  has_mic_in, has_usb, has_recording,
  usb_speed, transfer_speed, battery_type, display_type, weight_grams,
  description, notes,
  netmd_js_compatible, webusb_filter, submitted_by, verified
) VALUES (
  uuid_generate_v4(),
  'Sony MZ-N1 (Rev.3)', 'Sony', 'MZ-N1', 'portable_netmd',
  '054c', '0075', 2001, 2003,
  'v3', TRUE, FALSE, FALSE,
  TRUE, FALSE, TRUE, TRUE,
  TRUE, TRUE, TRUE,
  '1.1', NULL, 'LIP-4WM gumstick', 'LCD', 100,
  'Sony''s first Net MD portable recorder. Features optical digital input, MDLP support, and USB connectivity for PC transfers.',
  'Third firmware revision with updated USB product ID.',
  TRUE, '{"vendorId": 1356, "productId": 117}'::jsonb, NULL, TRUE
);

-- MZ-N505 — PID 0x0084
INSERT INTO public.devices (
  id, name, manufacturer, model_number, device_type,
  usb_vid, usb_pid, year_released, year_discontinued,
  atrac_version, has_mdlp, has_himd, has_type_s,
  has_optical_in, has_optical_out, has_line_in, has_line_out,
  has_mic_in, has_usb, has_recording,
  usb_speed, transfer_speed, battery_type, display_type, weight_grams,
  description, notes,
  netmd_js_compatible, webusb_filter, submitted_by, verified
) VALUES (
  uuid_generate_v4(),
  'Sony MZ-N505', 'Sony', 'MZ-N505', 'portable_netmd',
  '054c', '0084', 2002, 2003,
  'v3', TRUE, FALSE, FALSE,
  FALSE, FALSE, TRUE, FALSE,
  TRUE, TRUE, TRUE,
  '1.1', NULL, 'LIP-4WM gumstick', 'LCD', 85,
  'Compact Net MD recorder with MDLP support. A popular mid-range model known for its slim design and reliable performance.',
  NULL,
  TRUE, '{"vendorId": 1356, "productId": 132}'::jsonb, NULL, TRUE
);

-- MZ-S1 — PID 0x0085
INSERT INTO public.devices (
  id, name, manufacturer, model_number, device_type,
  usb_vid, usb_pid, year_released, year_discontinued,
  atrac_version, has_mdlp, has_himd, has_type_s,
  has_optical_in, has_optical_out, has_line_in, has_line_out,
  has_mic_in, has_usb, has_recording,
  usb_speed, transfer_speed, battery_type, display_type, weight_grams,
  description, notes,
  netmd_js_compatible, webusb_filter, submitted_by, verified
) VALUES (
  uuid_generate_v4(),
  'Sony MZ-S1', 'Sony', 'MZ-S1', 'portable_netmd',
  '054c', '0085', 2002, 2003,
  'v3', TRUE, FALSE, FALSE,
  FALSE, FALSE, TRUE, FALSE,
  TRUE, TRUE, TRUE,
  '1.1', NULL, 'AA battery', 'LCD', 115,
  'Sports-oriented Net MD recorder with splash-resistant design. Rugged build with a wrap-around remote and AA battery compatibility.',
  'Sports model with splash-resistant casing. Uses standard AA battery instead of gumstick.',
  TRUE, '{"vendorId": 1356, "productId": 133}'::jsonb, NULL, TRUE
);

-- MZ-N707 — PID 0x0086
INSERT INTO public.devices (
  id, name, manufacturer, model_number, device_type,
  usb_vid, usb_pid, year_released, year_discontinued,
  atrac_version, has_mdlp, has_himd, has_type_s,
  has_optical_in, has_optical_out, has_line_in, has_line_out,
  has_mic_in, has_usb, has_recording,
  usb_speed, transfer_speed, battery_type, display_type, weight_grams,
  description, notes,
  netmd_js_compatible, webusb_filter, submitted_by, verified
) VALUES (
  uuid_generate_v4(),
  'Sony MZ-N707', 'Sony', 'MZ-N707', 'portable_netmd',
  '054c', '0086', 2002, 2003,
  'v3', TRUE, FALSE, FALSE,
  FALSE, FALSE, TRUE, TRUE,
  TRUE, TRUE, TRUE,
  '1.1', NULL, 'LIP-4WM gumstick', 'LCD', 78,
  'Slim and stylish Net MD recorder with MDLP support. Popular among enthusiasts for its compact design and sound quality.',
  NULL,
  TRUE, '{"vendorId": 1356, "productId": 134}'::jsonb, NULL, TRUE
);

-- MZ-N10 — PID 0x00c6
INSERT INTO public.devices (
  id, name, manufacturer, model_number, device_type,
  usb_vid, usb_pid, year_released, year_discontinued,
  atrac_version, has_mdlp, has_himd, has_type_s,
  has_optical_in, has_optical_out, has_line_in, has_line_out,
  has_mic_in, has_usb, has_recording,
  usb_speed, transfer_speed, battery_type, display_type, weight_grams,
  description, notes,
  netmd_js_compatible, webusb_filter, submitted_by, verified
) VALUES (
  uuid_generate_v4(),
  'Sony MZ-N10', 'Sony', 'MZ-N10', 'portable_netmd',
  '054c', '00c6', 2003, 2004,
  'v3.5', TRUE, FALSE, TRUE,
  FALSE, FALSE, TRUE, TRUE,
  TRUE, TRUE, TRUE,
  '1.1', NULL, 'LIP-4WM gumstick', 'OLED', 68,
  'Premium ultra-slim Net MD recorder featuring Sony''s first OLED display on a MiniDisc device, Type-S DSP for enhanced sound quality, and an incredibly thin magnesium alloy body.',
  'One of the thinnest MD portables ever made. Highly sought after by collectors. Features an OLED display and Type-S sound processing.',
  TRUE, '{"vendorId": 1356, "productId": 198}'::jsonb, NULL, TRUE
);

-- MZ-N910 — PID 0x00c7
INSERT INTO public.devices (
  id, name, manufacturer, model_number, device_type,
  usb_vid, usb_pid, year_released, year_discontinued,
  atrac_version, has_mdlp, has_himd, has_type_s,
  has_optical_in, has_optical_out, has_line_in, has_line_out,
  has_mic_in, has_usb, has_recording,
  usb_speed, transfer_speed, battery_type, display_type, weight_grams,
  description, notes,
  netmd_js_compatible, webusb_filter, submitted_by, verified
) VALUES (
  uuid_generate_v4(),
  'Sony MZ-N910', 'Sony', 'MZ-N910', 'portable_netmd',
  '054c', '00c7', 2003, 2004,
  'v3.5', TRUE, FALSE, TRUE,
  FALSE, FALSE, TRUE, TRUE,
  TRUE, TRUE, TRUE,
  '1.1', NULL, 'LIP-4WM gumstick', 'LCD', 82,
  'High-end Net MD recorder with Type-S DSP for superior sound quality. Features a sleek design with backlit LCD remote.',
  'Type-S model offering improved ATRAC encoding and decoding quality.',
  TRUE, '{"vendorId": 1356, "productId": 199}'::jsonb, NULL, TRUE
);

-- MZ-N710/NF810 — PID 0x00c8
INSERT INTO public.devices (
  id, name, manufacturer, model_number, device_type,
  usb_vid, usb_pid, year_released, year_discontinued,
  atrac_version, has_mdlp, has_himd, has_type_s,
  has_optical_in, has_optical_out, has_line_in, has_line_out,
  has_mic_in, has_usb, has_recording,
  usb_speed, transfer_speed, battery_type, display_type, weight_grams,
  description, notes,
  netmd_js_compatible, webusb_filter, submitted_by, verified
) VALUES (
  uuid_generate_v4(),
  'Sony MZ-N710', 'Sony', 'MZ-N710', 'portable_netmd',
  '054c', '00c8', 2003, 2004,
  'v3.5', TRUE, FALSE, FALSE,
  FALSE, FALSE, TRUE, FALSE,
  TRUE, TRUE, TRUE,
  '1.1', NULL, 'LIP-4WM gumstick', 'LCD', 76,
  'Mid-range Net MD recorder with MDLP support. Compact design with reliable recording capabilities.',
  'Also sold as MZ-NF810 in some markets (with FM tuner).',
  TRUE, '{"vendorId": 1356, "productId": 200}'::jsonb, NULL, TRUE
);

-- MZ-N510/N610 — PID 0x00c9
INSERT INTO public.devices (
  id, name, manufacturer, model_number, device_type,
  usb_vid, usb_pid, year_released, year_discontinued,
  atrac_version, has_mdlp, has_himd, has_type_s,
  has_optical_in, has_optical_out, has_line_in, has_line_out,
  has_mic_in, has_usb, has_recording,
  usb_speed, transfer_speed, battery_type, display_type, weight_grams,
  description, notes,
  netmd_js_compatible, webusb_filter, submitted_by, verified
) VALUES (
  uuid_generate_v4(),
  'Sony MZ-N510', 'Sony', 'MZ-N510', 'portable_netmd',
  '054c', '00c9', 2003, 2004,
  'v3', TRUE, FALSE, FALSE,
  FALSE, FALSE, TRUE, FALSE,
  TRUE, TRUE, TRUE,
  '1.1', NULL, 'LIP-4WM gumstick', 'LCD', 76,
  'Entry-level Net MD recorder with MDLP support. Affordable option with solid recording quality.',
  'Also sold as MZ-N610 in some markets.',
  TRUE, '{"vendorId": 1356, "productId": 201}'::jsonb, NULL, TRUE
);

-- MZ-NE410/NF520D — PID 0x00ca (playback only)
INSERT INTO public.devices (
  id, name, manufacturer, model_number, device_type,
  usb_vid, usb_pid, year_released, year_discontinued,
  atrac_version, has_mdlp, has_himd, has_type_s,
  has_optical_in, has_optical_out, has_line_in, has_line_out,
  has_mic_in, has_usb, has_recording,
  usb_speed, transfer_speed, battery_type, display_type, weight_grams,
  description, notes,
  netmd_js_compatible, webusb_filter, submitted_by, verified
) VALUES (
  uuid_generate_v4(),
  'Sony MZ-NE410', 'Sony', 'MZ-NE410', 'portable_netmd',
  '054c', '00ca', 2003, 2004,
  'v3', TRUE, FALSE, FALSE,
  FALSE, FALSE, FALSE, FALSE,
  FALSE, TRUE, FALSE,
  '1.1', NULL, 'LIP-4WM gumstick', 'LCD', 68,
  'Net MD playback-only portable. Receives tracks via USB from PC but cannot record from analog or optical sources.',
  'Playback-only model — no recording capability. Also sold as MZ-NF520D (with FM tuner). Can receive Net MD transfers from PC.',
  TRUE, '{"vendorId": 1356, "productId": 202}'::jsonb, NULL, TRUE
);

-- MZ-NE810/NE910 — PID 0x00eb
INSERT INTO public.devices (
  id, name, manufacturer, model_number, device_type,
  usb_vid, usb_pid, year_released, year_discontinued,
  atrac_version, has_mdlp, has_himd, has_type_s,
  has_optical_in, has_optical_out, has_line_in, has_line_out,
  has_mic_in, has_usb, has_recording,
  usb_speed, transfer_speed, battery_type, display_type, weight_grams,
  description, notes,
  netmd_js_compatible, webusb_filter, submitted_by, verified
) VALUES (
  uuid_generate_v4(),
  'Sony MZ-NE810', 'Sony', 'MZ-NE810', 'portable_netmd',
  '054c', '00eb', 2003, 2004,
  'v3.5', TRUE, FALSE, TRUE,
  FALSE, FALSE, FALSE, TRUE,
  FALSE, TRUE, FALSE,
  '1.1', NULL, 'LIP-4WM gumstick', 'LCD', 78,
  'Premium Net MD playback-only portable with Type-S DSP for superior audio quality.',
  'Playback-only model with Type-S. Also sold as MZ-NE910 in some markets. Can receive Net MD transfers from PC.',
  TRUE, '{"vendorId": 1356, "productId": 235}'::jsonb, NULL, TRUE
);

-- ---------- Sony Shelf Systems ----------

-- LAM-1 — PID 0x007c
INSERT INTO public.devices (
  id, name, manufacturer, model_number, device_type,
  usb_vid, usb_pid, year_released, year_discontinued,
  atrac_version, has_mdlp, has_himd, has_type_s,
  has_optical_in, has_optical_out, has_line_in, has_line_out,
  has_mic_in, has_usb, has_recording,
  usb_speed, transfer_speed, battery_type, display_type, weight_grams,
  description, notes,
  netmd_js_compatible, webusb_filter, submitted_by, verified
) VALUES (
  uuid_generate_v4(),
  'Sony LAM-1', 'Sony', 'LAM-1', 'shelf_system',
  '054c', '007c', 2001, 2003,
  'v3', TRUE, FALSE, FALSE,
  TRUE, TRUE, TRUE, TRUE,
  FALSE, TRUE, TRUE,
  '1.1', NULL, 'AC powered', 'LCD', NULL,
  'Net MD-equipped personal audio system with CD player, AM/FM tuner, and MiniDisc recorder. Features USB connectivity for PC-to-MD transfers.',
  'Compact shelf system with integrated Net MD deck.',
  TRUE, '{"vendorId": 1356, "productId": 124}'::jsonb, NULL, TRUE
);

-- LAM-3 — PID 0x0080
INSERT INTO public.devices (
  id, name, manufacturer, model_number, device_type,
  usb_vid, usb_pid, year_released, year_discontinued,
  atrac_version, has_mdlp, has_himd, has_type_s,
  has_optical_in, has_optical_out, has_line_in, has_line_out,
  has_mic_in, has_usb, has_recording,
  usb_speed, transfer_speed, battery_type, display_type, weight_grams,
  description, notes,
  netmd_js_compatible, webusb_filter, submitted_by, verified
) VALUES (
  uuid_generate_v4(),
  'Sony LAM-3', 'Sony', 'LAM-3', 'shelf_system',
  '054c', '0080', 2002, 2003,
  'v3', TRUE, FALSE, FALSE,
  TRUE, TRUE, TRUE, TRUE,
  FALSE, TRUE, TRUE,
  '1.1', NULL, 'AC powered', 'LCD', NULL,
  'Updated personal audio system with Net MD, CD player, and AM/FM tuner. Improved design over the LAM-1.',
  NULL,
  TRUE, '{"vendorId": 1356, "productId": 128}'::jsonb, NULL, TRUE
);

-- CMT-C7NT — PID 0x008e
INSERT INTO public.devices (
  id, name, manufacturer, model_number, device_type,
  usb_vid, usb_pid, year_released, year_discontinued,
  atrac_version, has_mdlp, has_himd, has_type_s,
  has_optical_in, has_optical_out, has_line_in, has_line_out,
  has_mic_in, has_usb, has_recording,
  usb_speed, transfer_speed, battery_type, display_type, weight_grams,
  description, notes,
  netmd_js_compatible, webusb_filter, submitted_by, verified
) VALUES (
  uuid_generate_v4(),
  'Sony CMT-C7NT', 'Sony', 'CMT-C7NT', 'shelf_system',
  '054c', '008e', 2002, 2004,
  'v3', TRUE, FALSE, FALSE,
  TRUE, TRUE, TRUE, TRUE,
  FALSE, TRUE, TRUE,
  '1.1', NULL, 'AC powered', 'LCD', NULL,
  'Micro hi-fi component system with Net MD, CD player, cassette deck, and AM/FM tuner. USB connectivity for Net MD transfers.',
  NULL,
  TRUE, '{"vendorId": 1356, "productId": 142}'::jsonb, NULL, TRUE
);

-- CMT-L7HD — PID 0x00ad
INSERT INTO public.devices (
  id, name, manufacturer, model_number, device_type,
  usb_vid, usb_pid, year_released, year_discontinued,
  atrac_version, has_mdlp, has_himd, has_type_s,
  has_optical_in, has_optical_out, has_line_in, has_line_out,
  has_mic_in, has_usb, has_recording,
  usb_speed, transfer_speed, battery_type, display_type, weight_grams,
  description, notes,
  netmd_js_compatible, webusb_filter, submitted_by, verified
) VALUES (
  uuid_generate_v4(),
  'Sony CMT-L7HD', 'Sony', 'CMT-L7HD', 'shelf_system',
  '054c', '00ad', 2003, 2004,
  'v3', TRUE, FALSE, FALSE,
  TRUE, TRUE, TRUE, TRUE,
  FALSE, TRUE, TRUE,
  '1.1', NULL, 'AC powered', 'LCD', NULL,
  'Slim micro component system with Net MD, CD, HDD, and AM/FM tuner. Features a built-in hard drive for music storage alongside MiniDisc.',
  'Features integrated hard drive alongside Net MD deck.',
  TRUE, '{"vendorId": 1356, "productId": 173}'::jsonb, NULL, TRUE
);

-- CMT-M333NT/M373NT — PID 0x00e7
INSERT INTO public.devices (
  id, name, manufacturer, model_number, device_type,
  usb_vid, usb_pid, year_released, year_discontinued,
  atrac_version, has_mdlp, has_himd, has_type_s,
  has_optical_in, has_optical_out, has_line_in, has_line_out,
  has_mic_in, has_usb, has_recording,
  usb_speed, transfer_speed, battery_type, display_type, weight_grams,
  description, notes,
  netmd_js_compatible, webusb_filter, submitted_by, verified
) VALUES (
  uuid_generate_v4(),
  'Sony CMT-M333NT', 'Sony', 'CMT-M333NT', 'shelf_system',
  '054c', '00e7', 2003, 2005,
  'v3', TRUE, FALSE, FALSE,
  TRUE, TRUE, TRUE, TRUE,
  FALSE, TRUE, TRUE,
  '1.1', NULL, 'AC powered', 'LCD', NULL,
  'Micro hi-fi component system with Net MD, 3-disc CD changer, and AM/FM tuner. USB connectivity for Net MD transfers.',
  'Also sold as CMT-M373NT in some markets.',
  TRUE, '{"vendorId": 1356, "productId": 231}'::jsonb, NULL, TRUE
);

-- LAM-10 — PID 0x0101
INSERT INTO public.devices (
  id, name, manufacturer, model_number, device_type,
  usb_vid, usb_pid, year_released, year_discontinued,
  atrac_version, has_mdlp, has_himd, has_type_s,
  has_optical_in, has_optical_out, has_line_in, has_line_out,
  has_mic_in, has_usb, has_recording,
  usb_speed, transfer_speed, battery_type, display_type, weight_grams,
  description, notes,
  netmd_js_compatible, webusb_filter, submitted_by, verified
) VALUES (
  uuid_generate_v4(),
  'Sony LAM-10', 'Sony', 'LAM-10', 'shelf_system',
  '054c', '0101', 2003, 2004,
  'v3', TRUE, FALSE, FALSE,
  TRUE, TRUE, TRUE, TRUE,
  FALSE, TRUE, TRUE,
  '1.1', NULL, 'AC powered', 'LCD', NULL,
  'Personal audio system with Net MD, CD player, and AM/FM tuner. Updated successor to the LAM-3 with improved styling.',
  NULL,
  TRUE, '{"vendorId": 1356, "productId": 257}'::jsonb, NULL, TRUE
);

-- ---------- Sony Net MD Decks ----------

-- MDS-JE780/JB980/NT1 — PID 0x0081
INSERT INTO public.devices (
  id, name, manufacturer, model_number, device_type,
  usb_vid, usb_pid, year_released, year_discontinued,
  atrac_version, has_mdlp, has_himd, has_type_s,
  has_optical_in, has_optical_out, has_line_in, has_line_out,
  has_mic_in, has_usb, has_recording,
  usb_speed, transfer_speed, battery_type, display_type, weight_grams,
  description, notes,
  netmd_js_compatible, webusb_filter, submitted_by, verified
) VALUES (
  uuid_generate_v4(),
  'Sony MDS-JE780', 'Sony', 'MDS-JE780', 'deck_netmd',
  '054c', '0081', 2002, 2004,
  'v3', TRUE, FALSE, FALSE,
  TRUE, TRUE, TRUE, TRUE,
  FALSE, TRUE, TRUE,
  '1.1', NULL, 'AC powered', 'FL display', NULL,
  'Full-size Net MD component deck with optical and analog inputs/outputs. High-quality recording and playback for home audio systems.',
  'Also sold as MDS-JB980 and MDS-NT1 in some markets. Full-size component deck.',
  TRUE, '{"vendorId": 1356, "productId": 129}'::jsonb, NULL, TRUE
);

-- MDS-S500 — PID 0x0113
INSERT INTO public.devices (
  id, name, manufacturer, model_number, device_type,
  usb_vid, usb_pid, year_released, year_discontinued,
  atrac_version, has_mdlp, has_himd, has_type_s,
  has_optical_in, has_optical_out, has_line_in, has_line_out,
  has_mic_in, has_usb, has_recording,
  usb_speed, transfer_speed, battery_type, display_type, weight_grams,
  description, notes,
  netmd_js_compatible, webusb_filter, submitted_by, verified
) VALUES (
  uuid_generate_v4(),
  'Sony MDS-S500', 'Sony', 'MDS-S500', 'deck_netmd',
  '054c', '0113', 2003, 2005,
  'v3', TRUE, FALSE, FALSE,
  TRUE, FALSE, TRUE, TRUE,
  FALSE, TRUE, TRUE,
  '1.1', NULL, 'AC powered', 'FL display', NULL,
  'Slim-profile Net MD component deck. Compact design fits easily into home audio setups with optical input and Net MD USB connectivity.',
  'Slim deck design. One of the last Net MD component decks produced.',
  TRUE, '{"vendorId": 1356, "productId": 275}'::jsonb, NULL, TRUE
);

-- ---------- Sony Professional / PC ----------

-- PCGA-MDN1 — PID 0x0097
INSERT INTO public.devices (
  id, name, manufacturer, model_number, device_type,
  usb_vid, usb_pid, year_released, year_discontinued,
  atrac_version, has_mdlp, has_himd, has_type_s,
  has_optical_in, has_optical_out, has_line_in, has_line_out,
  has_mic_in, has_usb, has_recording,
  usb_speed, transfer_speed, battery_type, display_type, weight_grams,
  description, notes,
  netmd_js_compatible, webusb_filter, submitted_by, verified
) VALUES (
  uuid_generate_v4(),
  'Sony PCGA-MDN1', 'Sony', 'PCGA-MDN1', 'professional',
  '054c', '0097', 2002, 2003,
  'v3', TRUE, FALSE, FALSE,
  FALSE, FALSE, FALSE, FALSE,
  FALSE, TRUE, TRUE,
  '1.1', NULL, 'USB powered', 'None', NULL,
  'External USB Net MD drive designed for Sony VAIO PCs. Allows MiniDisc recording and playback directly from a PC without standalone operation.',
  'PC peripheral Net MD drive. Designed as a VAIO accessory. USB-powered, no standalone playback.',
  TRUE, '{"vendorId": 1356, "productId": 151}'::jsonb, NULL, TRUE
);

-- ---------- Sony Hi-MD Portables ----------

-- MZ-NH600/NH600D — PID 0x0186
INSERT INTO public.devices (
  id, name, manufacturer, model_number, device_type,
  usb_vid, usb_pid, year_released, year_discontinued,
  atrac_version, has_mdlp, has_himd, has_type_s,
  has_optical_in, has_optical_out, has_line_in, has_line_out,
  has_mic_in, has_usb, has_recording,
  usb_speed, transfer_speed, battery_type, display_type, weight_grams,
  description, notes,
  netmd_js_compatible, webusb_filter, submitted_by, verified
) VALUES (
  uuid_generate_v4(),
  'Sony MZ-NH600', 'Sony', 'MZ-NH600', 'portable_himd',
  '054c', '0186', 2004, 2006,
  'v4', TRUE, TRUE, FALSE,
  FALSE, FALSE, TRUE, FALSE,
  TRUE, TRUE, TRUE,
  '2.0', '64x LP4', 'LIP-4WM gumstick', 'LCD', 95,
  'Entry-level Hi-MD portable recorder. Supports both Hi-MD and standard MD formats with USB 2.0 high-speed transfers.',
  'Also sold as MZ-NH600D in some markets. Entry-level Hi-MD model.',
  TRUE, '{"vendorId": 1356, "productId": 390}'::jsonb, NULL, TRUE
);

-- MZ-NH700 — PID 0x0187
INSERT INTO public.devices (
  id, name, manufacturer, model_number, device_type,
  usb_vid, usb_pid, year_released, year_discontinued,
  atrac_version, has_mdlp, has_himd, has_type_s,
  has_optical_in, has_optical_out, has_line_in, has_line_out,
  has_mic_in, has_usb, has_recording,
  usb_speed, transfer_speed, battery_type, display_type, weight_grams,
  description, notes,
  netmd_js_compatible, webusb_filter, submitted_by, verified
) VALUES (
  uuid_generate_v4(),
  'Sony MZ-NH700', 'Sony', 'MZ-NH700', 'portable_himd',
  '054c', '0187', 2004, 2006,
  'v4', TRUE, TRUE, FALSE,
  FALSE, FALSE, TRUE, TRUE,
  TRUE, TRUE, TRUE,
  '2.0', '64x LP4', 'LIP-4WM gumstick', 'LCD', 85,
  'Mid-range Hi-MD portable recorder with line output. Supports Hi-MD and standard MD formats.',
  NULL,
  TRUE, '{"vendorId": 1356, "productId": 391}'::jsonb, NULL, TRUE
);

-- MZ-NH800 — PID 0x0188
INSERT INTO public.devices (
  id, name, manufacturer, model_number, device_type,
  usb_vid, usb_pid, year_released, year_discontinued,
  atrac_version, has_mdlp, has_himd, has_type_s,
  has_optical_in, has_optical_out, has_line_in, has_line_out,
  has_mic_in, has_usb, has_recording,
  usb_speed, transfer_speed, battery_type, display_type, weight_grams,
  description, notes,
  netmd_js_compatible, webusb_filter, submitted_by, verified
) VALUES (
  uuid_generate_v4(),
  'Sony MZ-NH800', 'Sony', 'MZ-NH800', 'portable_himd',
  '054c', '0188', 2004, 2006,
  'v4', TRUE, TRUE, FALSE,
  FALSE, FALSE, TRUE, TRUE,
  TRUE, TRUE, TRUE,
  '2.0', '64x LP4', 'LIP-4WM gumstick', 'LCD', 85,
  'Mid-range Hi-MD portable recorder with refined design. Features line output and USB 2.0 connectivity.',
  NULL,
  TRUE, '{"vendorId": 1356, "productId": 392}'::jsonb, NULL, TRUE
);

-- MZ-NH900 — PID 0x018a
INSERT INTO public.devices (
  id, name, manufacturer, model_number, device_type,
  usb_vid, usb_pid, year_released, year_discontinued,
  atrac_version, has_mdlp, has_himd, has_type_s,
  has_optical_in, has_optical_out, has_line_in, has_line_out,
  has_mic_in, has_usb, has_recording,
  usb_speed, transfer_speed, battery_type, display_type, weight_grams,
  description, notes,
  netmd_js_compatible, webusb_filter, submitted_by, verified
) VALUES (
  uuid_generate_v4(),
  'Sony MZ-NH900', 'Sony', 'MZ-NH900', 'portable_himd',
  '054c', '018a', 2004, 2006,
  'v4.5', TRUE, TRUE, TRUE,
  TRUE, FALSE, TRUE, TRUE,
  TRUE, TRUE, TRUE,
  '2.0', '64x LP4', 'LIP-4WM gumstick', 'LCD', 85,
  'Premium Hi-MD portable recorder with optical input and Type-S DSP. Full recording capabilities with superior sound processing.',
  'Premium first-generation Hi-MD with optical input and Type-S.',
  TRUE, '{"vendorId": 1356, "productId": 394}'::jsonb, NULL, TRUE
);

-- MZ-NH1 — PID 0x0219
INSERT INTO public.devices (
  id, name, manufacturer, model_number, device_type,
  usb_vid, usb_pid, year_released, year_discontinued,
  atrac_version, has_mdlp, has_himd, has_type_s,
  has_optical_in, has_optical_out, has_line_in, has_line_out,
  has_mic_in, has_usb, has_recording,
  usb_speed, transfer_speed, battery_type, display_type, weight_grams,
  description, notes,
  netmd_js_compatible, webusb_filter, submitted_by, verified
) VALUES (
  uuid_generate_v4(),
  'Sony MZ-NH1', 'Sony', 'MZ-NH1', 'portable_himd',
  '054c', '0219', 2004, 2006,
  'v4.5', TRUE, TRUE, TRUE,
  TRUE, FALSE, TRUE, TRUE,
  TRUE, TRUE, TRUE,
  '2.0', '64x LP4', 'LIP-4WM gumstick', 'OLED', 87,
  'Flagship Hi-MD portable recorder with OLED display, optical input, and Type-S DSP. Premium magnesium alloy construction with exceptional build quality.',
  'Flagship Hi-MD model with OLED display. Highly collectible.',
  TRUE, '{"vendorId": 1356, "productId": 537}'::jsonb, NULL, TRUE
);

-- MZ-NH3D — PID 0x021b
INSERT INTO public.devices (
  id, name, manufacturer, model_number, device_type,
  usb_vid, usb_pid, year_released, year_discontinued,
  atrac_version, has_mdlp, has_himd, has_type_s,
  has_optical_in, has_optical_out, has_line_in, has_line_out,
  has_mic_in, has_usb, has_recording,
  usb_speed, transfer_speed, battery_type, display_type, weight_grams,
  description, notes,
  netmd_js_compatible, webusb_filter, submitted_by, verified
) VALUES (
  uuid_generate_v4(),
  'Sony MZ-NH3D', 'Sony', 'MZ-NH3D', 'portable_himd',
  '054c', '021b', 2005, 2006,
  'v4', TRUE, TRUE, FALSE,
  FALSE, FALSE, TRUE, FALSE,
  TRUE, TRUE, TRUE,
  '2.0', '64x LP4', 'LIP-4WM gumstick', 'LCD', 78,
  'Budget-friendly Hi-MD portable recorder. Compact and lightweight with essential recording and playback features.',
  'Budget Hi-MD model. Lightweight and affordable.',
  TRUE, '{"vendorId": 1356, "productId": 539}'::jsonb, NULL, TRUE
);

-- MZ-RH10 — PID 0x022c
INSERT INTO public.devices (
  id, name, manufacturer, model_number, device_type,
  usb_vid, usb_pid, year_released, year_discontinued,
  atrac_version, has_mdlp, has_himd, has_type_s,
  has_optical_in, has_optical_out, has_line_in, has_line_out,
  has_mic_in, has_usb, has_recording,
  usb_speed, transfer_speed, battery_type, display_type, weight_grams,
  description, notes,
  netmd_js_compatible, webusb_filter, submitted_by, verified
) VALUES (
  uuid_generate_v4(),
  'Sony MZ-RH10', 'Sony', 'MZ-RH10', 'portable_himd',
  '054c', '022c', 2005, 2007,
  'v4.5', TRUE, TRUE, TRUE,
  FALSE, FALSE, TRUE, TRUE,
  TRUE, TRUE, TRUE,
  '2.0', '64x LP4', 'LIP-4WM gumstick', 'Color LCD', 91,
  'Hi-MD portable recorder featuring Sony''s first color LCD display on a MiniDisc device. Type-S DSP for enhanced playback quality.',
  'First MD portable with a color LCD screen.',
  TRUE, '{"vendorId": 1356, "productId": 556}'::jsonb, NULL, TRUE
);

-- MZ-RH910 — PID 0x023c
INSERT INTO public.devices (
  id, name, manufacturer, model_number, device_type,
  usb_vid, usb_pid, year_released, year_discontinued,
  atrac_version, has_mdlp, has_himd, has_type_s,
  has_optical_in, has_optical_out, has_line_in, has_line_out,
  has_mic_in, has_usb, has_recording,
  usb_speed, transfer_speed, battery_type, display_type, weight_grams,
  description, notes,
  netmd_js_compatible, webusb_filter, submitted_by, verified
) VALUES (
  uuid_generate_v4(),
  'Sony MZ-RH910', 'Sony', 'MZ-RH910', 'portable_himd',
  '054c', '023c', 2005, 2007,
  'v4.5', TRUE, TRUE, TRUE,
  FALSE, FALSE, TRUE, TRUE,
  TRUE, TRUE, TRUE,
  '2.0', '64x LP4', 'LIP-4WM gumstick', 'LCD', 82,
  'Slim Hi-MD portable recorder with Type-S DSP. Refined second-generation Hi-MD design with improved battery life.',
  NULL,
  TRUE, '{"vendorId": 1356, "productId": 572}'::jsonb, NULL, TRUE
);

-- MZ-RH1/M200 — PID 0x0286
INSERT INTO public.devices (
  id, name, manufacturer, model_number, device_type,
  usb_vid, usb_pid, year_released, year_discontinued,
  atrac_version, has_mdlp, has_himd, has_type_s,
  has_optical_in, has_optical_out, has_line_in, has_line_out,
  has_mic_in, has_usb, has_recording,
  usb_speed, transfer_speed, battery_type, display_type, weight_grams,
  description, notes,
  netmd_js_compatible, webusb_filter, submitted_by, verified
) VALUES (
  uuid_generate_v4(),
  'Sony MZ-RH1', 'Sony', 'MZ-RH1', 'portable_himd',
  '054c', '0286', 2006, 2011,
  'v4.5', TRUE, TRUE, TRUE,
  TRUE, FALSE, TRUE, TRUE,
  TRUE, TRUE, TRUE,
  '2.0', '64x LP4', 'LIP-4WM gumstick', 'OLED', 109,
  'The final and most capable MiniDisc portable ever made. The only device that supports uploading recordings from MD to PC in digital form. Features OLED display, optical input, Type-S DSP, and exceptional build quality in a magnesium alloy body. The holy grail for MiniDisc enthusiasts.',
  'The most sought-after MiniDisc device. Only portable capable of digital upload (MD → PC). Also sold as MZ-M200 in some markets. Last MiniDisc portable produced by Sony.',
  TRUE, '{"vendorId": 1356, "productId": 646}'::jsonb, NULL, TRUE
);

-- ---------- Sony Hi-MD Deck ----------

-- MDS-JE480 — PID 0x0287
INSERT INTO public.devices (
  id, name, manufacturer, model_number, device_type,
  usb_vid, usb_pid, year_released, year_discontinued,
  atrac_version, has_mdlp, has_himd, has_type_s,
  has_optical_in, has_optical_out, has_line_in, has_line_out,
  has_mic_in, has_usb, has_recording,
  usb_speed, transfer_speed, battery_type, display_type, weight_grams,
  description, notes,
  netmd_js_compatible, webusb_filter, submitted_by, verified
) VALUES (
  uuid_generate_v4(),
  'Sony MDS-JE480', 'Sony', 'MDS-JE480', 'deck_netmd',
  '054c', '0287', 2003, 2005,
  'v3', TRUE, FALSE, FALSE,
  TRUE, FALSE, TRUE, TRUE,
  FALSE, TRUE, TRUE,
  '1.1', NULL, 'AC powered', 'FL display', NULL,
  'Net MD component deck with optical input, analog input/output, and USB connectivity. Compact single-disc design for home audio systems.',
  NULL,
  TRUE, '{"vendorId": 1356, "productId": 647}'::jsonb, NULL, TRUE
);

-- ---------- Aiwa ----------

-- AM-NX1 — PID 0x014c
INSERT INTO public.devices (
  id, name, manufacturer, model_number, device_type,
  usb_vid, usb_pid, year_released, year_discontinued,
  atrac_version, has_mdlp, has_himd, has_type_s,
  has_optical_in, has_optical_out, has_line_in, has_line_out,
  has_mic_in, has_usb, has_recording,
  usb_speed, transfer_speed, battery_type, display_type, weight_grams,
  description, notes,
  netmd_js_compatible, webusb_filter, submitted_by, verified
) VALUES (
  uuid_generate_v4(),
  'Aiwa AM-NX1', 'Aiwa', 'AM-NX1', 'portable_netmd',
  '054c', '014c', 2002, 2003,
  'v3', TRUE, FALSE, FALSE,
  FALSE, FALSE, TRUE, FALSE,
  TRUE, TRUE, TRUE,
  '1.1', NULL, 'LIP-4WM gumstick', 'LCD', 80,
  'Aiwa''s first Net MD portable recorder. Compact design with MDLP support and USB connectivity. Uses Sony USB vendor ID as Aiwa was a Sony subsidiary.',
  'Uses Sony USB vendor ID (054c). Aiwa was a subsidiary of Sony.',
  TRUE, '{"vendorId": 1356, "productId": 332}'::jsonb, NULL, TRUE
);

-- AM-NX9 — PID 0x017e
INSERT INTO public.devices (
  id, name, manufacturer, model_number, device_type,
  usb_vid, usb_pid, year_released, year_discontinued,
  atrac_version, has_mdlp, has_himd, has_type_s,
  has_optical_in, has_optical_out, has_line_in, has_line_out,
  has_mic_in, has_usb, has_recording,
  usb_speed, transfer_speed, battery_type, display_type, weight_grams,
  description, notes,
  netmd_js_compatible, webusb_filter, submitted_by, verified
) VALUES (
  uuid_generate_v4(),
  'Aiwa AM-NX9', 'Aiwa', 'AM-NX9', 'portable_netmd',
  '054c', '017e', 2003, 2004,
  'v3', TRUE, FALSE, FALSE,
  FALSE, FALSE, TRUE, FALSE,
  TRUE, TRUE, TRUE,
  '1.1', NULL, 'LIP-4WM gumstick', 'LCD', 75,
  'Aiwa''s updated Net MD portable recorder. Slimmer and lighter than the AM-NX1 with improved battery life.',
  'Uses Sony USB vendor ID (054c). One of the last Aiwa-branded MD products before the brand was absorbed by Sony.',
  TRUE, '{"vendorId": 1356, "productId": 382}'::jsonb, NULL, TRUE
);

-- ---------- Sharp ----------

-- IM-MT880H/MT899H — PID 0x7202
INSERT INTO public.devices (
  id, name, manufacturer, model_number, device_type,
  usb_vid, usb_pid, year_released, year_discontinued,
  atrac_version, has_mdlp, has_himd, has_type_s,
  has_optical_in, has_optical_out, has_line_in, has_line_out,
  has_mic_in, has_usb, has_recording,
  usb_speed, transfer_speed, battery_type, display_type, weight_grams,
  description, notes,
  netmd_js_compatible, webusb_filter, submitted_by, verified
) VALUES (
  uuid_generate_v4(),
  'Sharp IM-MT880H', 'Sharp', 'IM-MT880H', 'portable_netmd',
  '04dd', '7202', 2002, 2004,
  'v3', TRUE, FALSE, FALSE,
  FALSE, FALSE, TRUE, FALSE,
  TRUE, TRUE, TRUE,
  '1.1', NULL, 'Proprietary rechargeable', 'LCD', 82,
  'Sharp''s Net MD portable recorder with distinctive design. Features MDLP support and USB connectivity for PC transfers.',
  'Also sold as IM-MT899H in some markets.',
  TRUE, '{"vendorId": 1245, "productId": 29186}'::jsonb, NULL, TRUE
);

-- IM-DR400/DR410 — PID 0x9013
INSERT INTO public.devices (
  id, name, manufacturer, model_number, device_type,
  usb_vid, usb_pid, year_released, year_discontinued,
  atrac_version, has_mdlp, has_himd, has_type_s,
  has_optical_in, has_optical_out, has_line_in, has_line_out,
  has_mic_in, has_usb, has_recording,
  usb_speed, transfer_speed, battery_type, display_type, weight_grams,
  description, notes,
  netmd_js_compatible, webusb_filter, submitted_by, verified
) VALUES (
  uuid_generate_v4(),
  'Sharp IM-DR400', 'Sharp', 'IM-DR400', 'portable_netmd',
  '04dd', '9013', 2002, 2004,
  'v3', TRUE, FALSE, FALSE,
  FALSE, FALSE, TRUE, FALSE,
  TRUE, TRUE, TRUE,
  '1.1', NULL, 'AA battery', 'LCD', 88,
  'Sharp Net MD portable with standard AA battery support. Practical design aimed at general consumers.',
  'Also sold as IM-DR410 in some markets. Uses standard AA battery.',
  TRUE, '{"vendorId": 1245, "productId": 36883}'::jsonb, NULL, TRUE
);

-- IM-DR80/DR420/DR580 — PID 0x9014
INSERT INTO public.devices (
  id, name, manufacturer, model_number, device_type,
  usb_vid, usb_pid, year_released, year_discontinued,
  atrac_version, has_mdlp, has_himd, has_type_s,
  has_optical_in, has_optical_out, has_line_in, has_line_out,
  has_mic_in, has_usb, has_recording,
  usb_speed, transfer_speed, battery_type, display_type, weight_grams,
  description, notes,
  netmd_js_compatible, webusb_filter, submitted_by, verified
) VALUES (
  uuid_generate_v4(),
  'Sharp IM-DR80', 'Sharp', 'IM-DR80', 'portable_netmd',
  '04dd', '9014', 2003, 2005,
  'v3', TRUE, FALSE, FALSE,
  FALSE, FALSE, TRUE, FALSE,
  TRUE, TRUE, TRUE,
  '1.1', NULL, 'Proprietary rechargeable', 'LCD', 78,
  'Sharp''s compact Net MD portable recorder. Updated model with slimmer profile and improved MDLP encoding.',
  'Also sold as IM-DR420 and IM-DR580 in various markets.',
  TRUE, '{"vendorId": 1245, "productId": 36884}'::jsonb, NULL, TRUE
);

-- ---------- Kenwood ----------

-- MDX-J9 — PID 0x1004 (car unit)
INSERT INTO public.devices (
  id, name, manufacturer, model_number, device_type,
  usb_vid, usb_pid, year_released, year_discontinued,
  atrac_version, has_mdlp, has_himd, has_type_s,
  has_optical_in, has_optical_out, has_line_in, has_line_out,
  has_mic_in, has_usb, has_recording,
  usb_speed, transfer_speed, battery_type, display_type, weight_grams,
  description, notes,
  netmd_js_compatible, webusb_filter, submitted_by, verified
) VALUES (
  uuid_generate_v4(),
  'Kenwood MDX-J9', 'Kenwood', 'MDX-J9', 'car_unit',
  '0b28', '1004', 2003, 2005,
  'v3', TRUE, FALSE, FALSE,
  FALSE, FALSE, TRUE, TRUE,
  FALSE, TRUE, TRUE,
  '1.1', NULL, '12V DC (car)', 'FL display', NULL,
  'Kenwood car MiniDisc head unit with Net MD USB connectivity. Allows loading tracks from PC for in-car playback.',
  'One of the few car MiniDisc units with Net MD support.',
  TRUE, '{"vendorId": 2856, "productId": 4100}'::jsonb, NULL, TRUE
);

-- ---------- Panasonic ----------

-- SJ-MR250 — PID 0x23b3
INSERT INTO public.devices (
  id, name, manufacturer, model_number, device_type,
  usb_vid, usb_pid, year_released, year_discontinued,
  atrac_version, has_mdlp, has_himd, has_type_s,
  has_optical_in, has_optical_out, has_line_in, has_line_out,
  has_mic_in, has_usb, has_recording,
  usb_speed, transfer_speed, battery_type, display_type, weight_grams,
  description, notes,
  netmd_js_compatible, webusb_filter, submitted_by, verified
) VALUES (
  uuid_generate_v4(),
  'Panasonic SJ-MR250', 'Panasonic', 'SJ-MR250', 'portable_netmd',
  '04da', '23b3', 2003, 2005,
  'v3', TRUE, FALSE, FALSE,
  FALSE, FALSE, TRUE, FALSE,
  TRUE, TRUE, TRUE,
  '1.1', NULL, 'Proprietary rechargeable', 'LCD', 80,
  'Panasonic''s Net MD portable recorder. One of the few non-Sony Net MD devices with a distinctive Panasonic industrial design.',
  'One of very few Panasonic Net MD portables.',
  TRUE, '{"vendorId": 1242, "productId": 9139}'::jsonb, NULL, TRUE
);

-- SJ-MR270 — PID 0x23b6
INSERT INTO public.devices (
  id, name, manufacturer, model_number, device_type,
  usb_vid, usb_pid, year_released, year_discontinued,
  atrac_version, has_mdlp, has_himd, has_type_s,
  has_optical_in, has_optical_out, has_line_in, has_line_out,
  has_mic_in, has_usb, has_recording,
  usb_speed, transfer_speed, battery_type, display_type, weight_grams,
  description, notes,
  netmd_js_compatible, webusb_filter, submitted_by, verified
) VALUES (
  uuid_generate_v4(),
  'Panasonic SJ-MR270', 'Panasonic', 'SJ-MR270', 'portable_netmd',
  '04da', '23b6', 2004, 2005,
  'v3', TRUE, FALSE, FALSE,
  FALSE, FALSE, TRUE, FALSE,
  TRUE, TRUE, TRUE,
  '1.1', NULL, 'Proprietary rechargeable', 'LCD', 78,
  'Updated Panasonic Net MD portable recorder. Slimmer design with improved battery life over the SJ-MR250.',
  'Successor to SJ-MR250. One of the last Panasonic MD portables.',
  TRUE, '{"vendorId": 1242, "productId": 9142}'::jsonb, NULL, TRUE
);
