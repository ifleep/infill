/*
  `technology` changes from a single value (`String?`) to a list (`Json`,
  `string[]`), so a printer can be tagged with more than one technology —
  e.g. FDM *and* CoreXY *and* Large Format at once — instead of being forced
  to pick just one. Existing data is converted, not dropped: a product with
  `technology = 'CoreXY'` becomes `technology = '["CoreXY"]'`; a product with
  no technology set becomes `'[]'`, same as how `experienceLevel`/`useCases`
  already represent "none set" in this table.
*/

-- Add the new column as nullable first so this doesn't fail on existing rows
-- (added as its final type/nullability further down, once every row has a value).
ALTER TABLE `Product` ADD COLUMN `technology_new` JSON NULL;

-- Carry over any existing single value as a one-item list.
UPDATE `Product`
SET `technology_new` = JSON_ARRAY(`technology`)
WHERE `technology` IS NOT NULL AND `technology` != '';

-- Everything else (NULL or empty string) becomes an empty list, matching
-- how `experienceLevel`/`useCases` represent "none set".
UPDATE `Product`
SET `technology_new` = JSON_ARRAY()
WHERE `technology_new` IS NULL;

-- Drop the old column and give the new one its real name.
ALTER TABLE `Product` DROP COLUMN `technology`;
ALTER TABLE `Product` CHANGE `technology_new` `technology` JSON NOT NULL;
