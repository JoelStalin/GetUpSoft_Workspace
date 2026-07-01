# Galantes Jewelry - ORCA + GSTACK Drive product publishing prompt

## Purpose

Run a governed ORCA workflow that scans a Google Drive folder recursively, identifies jewelry products from the images, prepares polished product photos with NanoBanana, and publishes the products into Galantes Jewelry Odoo / shop with traceability and QA.

## Source folder

- Google Drive folder: `https://drive.google.com/drive/folders/1xkioDGmeOqoQ9eofPBlDzoXCzqoQDjHP?usp=sharing`

## Operating model

- ORCA is the base orchestrator and task state owner.
- GSTACK is the routing layer for model selection and fallback.
- Use the best model for each subtask:
  - vision / image grouping / OCR: multimodal model
  - product copy / descriptions: strong writing model
  - QA / consistency checks: review model
  - fallback: secondary model from the GSTACK list

## Backlog

- Scan the full Drive folder.
- Cluster images that belong to the same physical product.
- Infer product name, product type, and supporting description from the images and any OCR clues.
- Edit photos with NanoBanana so they look clean and consistent.
- Create or update the corresponding Odoo product records.
- Publish the products to the shop when the required data is complete.

## Definition of Ready

- Drive folder access is available.
- Odoo production connection is available.
- NanoBanana editing workflow is available.
- ORCA has an active routing config with GSTACK fallback models.

## Definition of Done

- Each product cluster has a product name, clean description, edited photos, and a publish decision.
- Every published product is visible in Odoo / shop.
- Any ambiguous product is left in draft and flagged for human review.
- Evidence is recorded for scan, grouping, editing, publication, and QA.

## Rules

1. Do not invent product names if the images do not support a confident identification.
2. Do not invent prices. If price is unavailable, create the product as draft or flag it for manual pricing.
3. Do not merge different products into one listing.
4. Preserve the real shape, stone color, metal tone, and size ratio of the jewelry during NanoBanana edits.
5. Do not over-retouch. Keep the product faithful to the source.
6. Publish only after QA validates the product card, images, and category.
7. Keep an audit trail with the original file IDs, edited file IDs, and final Odoo record IDs.

## Suggested workflow

```text
ORCA intake
  -> scan Drive folder recursively
  -> group images by product
  -> extract visual clues and OCR text
  -> draft product name and description
  -> edit images with NanoBanana
  -> QA the edited set
  -> create/update Odoo product
  -> publish or leave draft
  -> record evidence and summary
```

## Detailed steps

### 1. Folder scan

- Walk the folder recursively.
- Collect all image files and metadata.
- Normalize filenames and timestamps.
- Detect duplicate or near-duplicate images.

### 2. Product identification

- Cluster images by the same piece.
- Use visual similarity, angle, background, labels, and OCR.
- If there is one product with multiple angles, keep them in one product group.
- If a file appears to be packaging, workspace clutter, or unrelated content, exclude it.

### 3. Product naming

- Derive a concise product name from the item shape, stones, material, and style.
- Prefer product names that are clear for customers, not internal file names.
- If the name is uncertain, mark the item for review instead of guessing.

### 4. Description generation

- Write one short commercial description and one factual description.
- Mention visible features only.
- Do not claim certifications, karat, stone origin, or sizes unless they are visible or explicitly provided.

### 5. NanoBanana image prep

- Correct crop, exposure, and white balance.
- Remove distracting background clutter.
- Keep the jewelry centered and sharp.
- Export consistent aspect ratios for shop presentation.
- Generate a hero image and supporting gallery images.

### 6. Odoo publication

- Create or update the product template.
- Attach the edited gallery images.
- Set website visibility only after the content passes QA.
- Keep service products separate from physical inventory items.
- If required data is missing, create a draft instead of forcing publish.

### 7. QA

- Check title, description, image order, and product grouping.
- Verify the product is visible in the shop and renders the gallery correctly.
- Confirm the record did not overwrite an unrelated product.

## Required output from ORCA

- objective
- backlog item
- DoR
- DoD
- model routing used
- product groups discovered
- products published
- products left for review
- evidence paths
- risks
- rollback notes

## Suggested evidence

- folder scan log
- product cluster manifest
- before / after image samples
- Odoo record IDs
- shop preview screenshots
- QA summary

