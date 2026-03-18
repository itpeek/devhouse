import escapeHtml from "escape-html";

function serializeText(node) {
  let text = escapeHtml(node.text || "");

  if (node.bold) {
    text = `<strong>${text}</strong>`;
  }

  if (node.italic) {
    text = `<em>${text}</em>`;
  }

  if (node.underline) {
    text = `<u>${text}</u>`;
  }

  if (node.code) {
    text = `<code>${text}</code>`;
  }

  if (node.link?.href) {
    const href = escapeHtml(node.link.href);
    const target = escapeHtml(node.link.target || "_self");
    const rel = target === "_blank" ? ` rel="noopener noreferrer"` : "";
    text = `<a href="${href}" target="${target}"${rel}>${text}</a>`;
  }

  return text;
}

function serializeNode(node) {
  if (node.text !== undefined) {
    return serializeText(node);
  }

  const children = (node.children || []).map(serializeNode).join("");

  switch (node.type) {
    case "heading-one":
      return `<h1>${children}</h1>`;

    case "heading-two":
      return `<h2>${children}</h2>`;

    case "block-quote":
      return `<blockquote>${children}</blockquote>`;

    case "bulleted-list":
      return `<ul>${children}</ul>`;

    case "numbered-list":
      return `<ol>${children}</ol>`;

    case "list-item":
      return `<li>${children}</li>`;

    case "divider":
      return `<hr />`;

    case "image": {
      const src = escapeHtml(node.src || "");
      const alt = escapeHtml(node.alt || "");
      const imageTag = `<img src="${src}" alt="${alt}" />`;

      if (node.link?.href) {
        const href = escapeHtml(node.link.href);
        const target = escapeHtml(node.link.target || "_self");
        const rel = target === "_blank" ? ` rel="noopener noreferrer"` : "";
        return `<p><a href="${href}" target="${target}"${rel}>${imageTag}</a></p>`;
      }

      return `<p>${imageTag}</p>`;
    }

    default:
      return `<p>${children}</p>`;
  }
}

export function serializeSlateToHtml(value) {
  if (!Array.isArray(value)) return "";
  return value.map(serializeNode).join("");
}