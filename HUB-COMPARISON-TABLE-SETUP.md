# Hub Comparison Table — Setup Guide

Internal process for configuring the comparison table on a parent-category hub
after its template has been copied for a new parent collection (for example
`collection.hub-ledstrip.json`). Follow these steps in the Shopify theme editor.

## 1. Open the table in the theme editor

1. In Shopify admin go to **Online Store > Themes > Customize**.
2. In the top template/page selector, choose the **collection** that uses the
   new hub template (the new parent category).
3. In the left-hand section list, click **Hub Comparison Table**.
4. The settings panel on the left is where everything below is edited. Each hub
   template has its own copy of this section — see step 6.

## 2. Edit the row labels (the 5 attribute rows)

The table has up to 5 attribute rows. Their labels are **section-level
settings** (they apply to every column).

1. In the Hub Comparison Table settings, find the **Row labels** group.
2. Edit **Row 1 label** through **Row 5 label** to suit the category
   (defaults: Best for / Includes / Voltage / Skill level / Colour options).
3. To use fewer than 5 rows, **clear** a Row label field — that whole row
   disappears from the table.

## 3. Add, remove, or reorder product columns

Each product column is a **block** called **Product column**.

- **Add:** click **Add Product column** (max 8 columns).
- **Remove:** click the column block, then the bin/Remove option.
- **Reorder:** drag the column blocks up/down in the block list. The table
  renders columns left-to-right in that order.

## 4. Fields in each column

Click a **Product column** block. It has:

| Field | What goes in it |
|---|---|
| Column heading | The product name shown at the top (e.g. "Complete Kits"). Leave blank to hide the whole column. |
| Row 1 value | This column's answer for Row 1 (matches Row 1 label). |
| Row 2 value | This column's answer for Row 2. |
| Row 3 value | This column's answer for Row 3. |
| Row 4 value | This column's answer for Row 4. |
| Row 5 value | This column's answer for Row 5. |
| Shop link URL | Where the column's Shop button goes — see step 5. |
| Shop button text | The pill button label (e.g. "Shop Kits"). |

Keep cell text short — one short phrase per cell reads best.

## 5. CRITICAL — fill in each column's Shop URL

**Every column ships with a blank Shop link URL. While it is blank, that
column has no Shop button at all.**

1. For each Product column, set **Shop link URL** to that category's
   collection or product URL (e.g. `/collections/led-strip-kits`).
2. Confirm the **Shop button text** reads correctly per column.
3. Save. Check the storefront — every column should now show a navy pill
   Shop button.

Do not skip this. A table with no Shop buttons is the most common launch
mistake.

## 6. This edits THIS hub only

Edits made here save to **this hub template's own copy** (e.g.
`collection.hub-ledstrip.json`). They do **not** affect the Fairground hub or
any other parent category. Each parent hub is independent — set each one up
separately using this guide.

## 7. Common mistakes

- **Blank row label** → that entire row is hidden across all columns.
- **Blank column heading** → that entire column is hidden across all rows.
- **Blank Shop link URL** → no Shop button on that column (table still shows,
  button just doesn't appear).
- **Editing the wrong template** → confirm step 1.2 selects the correct
  parent collection before editing.
- **Too-long cell text** → wraps and unbalances the columns; keep it to a
  short phrase.
