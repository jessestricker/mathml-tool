// Copyright 2023 Jesse Stricker.
// SPDX-License-Identifier: Apache-2.0

const ATTRIBUTES_TO_RETAIN_GLOBAL = new Set([
  "class",
  "dir",
  "displaystyle",
  "id",
  "nonce",
  "scriptlevel",
  "style",
  "tabindex",
]);
const ATTRIBUTES_TO_RETAIN = new Map([
  ["math", ["display"]],
  ["mi", ["mathvariant"]],
  [
    "mo",
    [
      "form",
      "lspace",
      "rspace",
      "stretchy",
      "symmetric",
      "maxsize",
      "minsize",
      "largeop",
      "movablelimits",
    ],
  ],
  ["mspace", ["width", "height", "depth"]],
  ["mfrac", ["linethickness"]],
  ["mpadded", ["width", "height", "depth", "lspace", "voffset"]],
  ["munderover", ["accent", "accentunder"]],
  ["mover", ["accent"]],
  ["munder", ["accentunder"]],
  ["mtd", ["columnspan", "rowspan"]],
]);

/**
 * Cleans up a `<math>` element tree.
 * @param mathElement The root `<math>` element.
 */
export function cleanupMathMl(mathElement: MathMLElement) {
  unwrapSemanticsElements(mathElement);
  unwrapTopLevelMrow(mathElement);
  visitElementTree(mathElement, cleanupAttributes);
}

/**
 * Replaces each `<semantics>` elements with its first child element.
 * @param mathElement The root `<math>` element.
 */
function unwrapSemanticsElements(mathElement: Element) {
  const semanticsElements = mathElement.getElementsByTagName("semantics");
  while (semanticsElements.length !== 0) {
    replaceWithFirstChild(semanticsElements.item(0)!);
  }
}

function unwrapTopLevelMrow(mathElement: Element) {
  while (true) {
    if (mathElement.childElementCount !== 1) {
      break;
    }
    const onlyChild = mathElement.firstElementChild!;
    if (onlyChild.tagName.toLowerCase() !== "mrow") {
      break;
    }
    // the only child is an <mrow> element
    replaceWithChildren(onlyChild);
  }
}

/**
 * Removes any attribute of an element that is not in a
 * global or element-specific set of attributes to retain.
 * @param element Any MathML element.
 */
function cleanupAttributes(element: Element) {
  const attributesToRetain = union(
    ATTRIBUTES_TO_RETAIN_GLOBAL,
    ATTRIBUTES_TO_RETAIN.get(element.tagName.toLowerCase()) ?? [],
  );
  for (const attr of element.getAttributeNames()) {
    if (!attributesToRetain.has(attr)) {
      element.removeAttribute(attr);
    }
  }
}

/**
 * Replaces an element with its first child element or
 * removes the element if it does not have any child elements.
 * @param element Any element.
 */
function replaceWithFirstChild(element: Element) {
  if (element.firstElementChild !== null) {
    element.replaceWith(element.firstElementChild);
  } else {
    element.remove();
  }
}

/**
 * Replaces an element with its child elements or
 * removes the element if it does not have any child elements.
 * @param element Any element.
 */
function replaceWithChildren(element: Element) {
  if (element.childElementCount !== 0) {
    element.replaceWith(...element.children);
  } else {
    element.remove();
  }
}

/**
 * Calls a function in an element tree recursively in a depth-first order.
 * @param start The element to start from.
 * @param visitor The function to call for each element.
 */
function visitElementTree(start: Element, visitor: (element: Element) => void) {
  for (const child of start.children) {
    visitElementTree(child, visitor);
  }
  visitor(start);
}

/**
 * Returns the union of a set and an iterable.
 * @param set A set of elements of type `T`.
 * @param iterable An iterable of elements of type `T`.
 * @returns A new set of elements of type `T` containing the union.
 */
function union<T>(set: Set<T>, iterable: Iterable<T>): Set<T> {
  const union = new Set(set); // clone the original set
  for (const element of iterable) {
    union.add(element);
  }
  return union;
}
