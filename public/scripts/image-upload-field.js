// Shared "upload image" affordance for plain text/URL fields that hold an
// image path. Attaches a thumbnail preview + upload button next to a text
// `<input>`, uploading through the existing R2-backed /api/upload-image
// endpoint and writing the returned path back into the field.
//
// Loaded as a plain classic (non-module) script so it can be referenced both
// from Astro components we own (plugins/site-content/**) and from HTML
// injected server-side by src/middleware.ts into core StudioCMS dashboard
// pages (page editor, site configuration) that live in node_modules and
// can't be edited directly.
(function () {
  function attachImageUploadField(input, opts) {
    if (!input || input.dataset.imageUploadAttached) return;
    input.dataset.imageUploadAttached = 'true';

    const uploadUrl = (opts && opts.uploadUrl) || '/api/upload-image';
    // Core StudioCMS's StorageInput wraps its <label> in a flex row
    // (`.storage-input-container`, shared with its own disabled "Browse
    // Files" button) — anchoring on that row instead of the inner <label>
    // keeps our upload button out of that row, so it drops to its own line
    // below the field instead of squeezing in beside the input.
    const anchor = input.closest('.storage-input-container') || input.closest('label') || input;

    const wrapper = document.createElement('div');
    wrapper.style.cssText = 'display:flex;align-items:center;gap:12px;margin:8px 0 16px;';

    const preview = document.createElement('img');
    preview.style.cssText =
      'width:56px;height:56px;object-fit:cover;border-radius:6px;background:rgba(127,127,127,0.15);display:none;';
    preview.alt = '';
    const showPreview = (src) => {
      if (!src) {
        preview.style.display = 'none';
        return;
      }
      preview.src = src;
      preview.style.display = 'block';
    };
    preview.onerror = () => {
      preview.style.display = 'none';
    };

    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/png,image/jpeg,image/webp,image/gif,image/svg+xml';
    fileInput.hidden = true;

    const uploadBtn = document.createElement('button');
    uploadBtn.type = 'button';
    uploadBtn.textContent = 'Upload image';
    uploadBtn.style.cssText =
      'padding:6px 12px;border-radius:6px;border:1px solid rgba(127,127,127,0.4);background:transparent;cursor:pointer;font-size:13px;';

    const status = document.createElement('span');
    status.style.cssText = 'font-size:12px;color:#a4a4a4;';

    uploadBtn.addEventListener('click', () => fileInput.click());

    fileInput.addEventListener('change', async () => {
      const file = fileInput.files && fileInput.files[0];
      if (!file) return;

      status.textContent = 'Uploading...';
      uploadBtn.disabled = true;

      try {
        const body = new FormData();
        body.append('file', file);
        const res = await fetch(uploadUrl, { method: 'POST', body });
        const json = await res.json();

        if (!res.ok || !json.ok) {
          status.textContent = json.error || 'Upload failed';
          return;
        }

        input.value = json.path;
        input.dispatchEvent(new Event('input', { bubbles: true }));
        showPreview(json.path);
        status.textContent = 'Uploaded';
        setTimeout(() => {
          status.textContent = '';
        }, 2000);
      } catch (err) {
        console.error('[image-upload-field] upload failed:', err);
        status.textContent = 'Upload failed';
      } finally {
        uploadBtn.disabled = false;
        fileInput.value = '';
      }
    });

    input.addEventListener('input', () => showPreview(input.value));
    showPreview(input.value);

    wrapper.append(preview, uploadBtn, fileInput, status);
    anchor.insertAdjacentElement('afterend', wrapper);
  }

  window.attachImageUploadField = attachImageUploadField;
})();
