-- Normalize Arabic-Indic digits stored in site_settings to Latin digits.
-- validate_order_totals casts these values to numeric, so Arabic digits
-- would make the cast fail (checkout error) or silently fall back to defaults.
-- Not applied to production until explicitly approved.

update public.site_settings
set value = translate(value::text, '٠١٢٣٤٥٦٧٨٩٫٬', '0123456789.')::jsonb
where value::text ~ '[٠-٩٫٬]';
