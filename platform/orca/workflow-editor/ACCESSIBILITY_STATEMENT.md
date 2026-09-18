# Accessibility Statement - ORCA Workflow Editor

**Last Updated:** 2026-05-22

## Commitment to Accessibility

GetUpSoft is committed to ensuring digital accessibility for all users. We strive to make ORCA Workflow Editor compliant with Web Content Accessibility Guidelines (WCAG) 2.1 Level AA standards.

---

## Supported Features

### Keyboard Navigation
- ✅ **Full keyboard accessibility** - All interactive elements are reachable via keyboard
- ✅ **Standard shortcuts:**
  - `Ctrl+K` / `Cmd+K` - Open search dialog
  - `Arrow Up/Down` - Navigate results
  - `Enter` - Select result
  - `Escape` - Close dialog
  - `Delete` / `Backspace` - Delete selected node
  - `Ctrl+D` / `Cmd+D` - Duplicate node
  - `Ctrl+C` / `Cmd+C` - Copy node
  - `Ctrl+V` / `Cmd+V` - Paste node
  - `Ctrl+A` / `Cmd+A` - Select all nodes

### Screen Reader Support
- ✅ **ARIA labels** on buttons and interactive elements
- ✅ **Semantic HTML** with Radix UI components
- ✅ **Role attributes** for custom components
- ✅ **Alternative text** for icons where applicable
- ⚠️ **Partial support** - Complex canvas interactions may need additional labels

### Motion & Animation
- ✅ **Respects `prefers-reduced-motion`** system preference
- ✅ **Smooth animations** (not jarring or flashing)
- ✅ **No auto-playing content**

### Color & Contrast
- ✅ **WCAG AA compliant text contrast** (4.5:1 for normal text)
- ✅ **Color-independent design** - Information not conveyed by color alone
- ✅ **High-contrast icons** with distinct shapes and labels

### Text & Typography
- ✅ **Readable font sizes** (minimum 12px for body text)
- ✅ **Adjustable zoom** (up to 200%)
- ✅ **Clear typography hierarchy**

---

## Known Accessibility Limitations

1. **Canvas Zoom Controls**
   - Complex gesture interactions may not be fully accessible
   - **Workaround:** Use keyboard shortcuts where available

2. **Drag-and-Drop**
   - Visual drag feedback may be difficult for screen reader users
   - **Workaround:** Use context menu for node operations

3. **Real-Time Collaboration**
   - Not yet fully accessible for multi-user scenarios
   - Cursor tracking may conflict with screen reader navigation

4. **Custom Node Rendering**
   - User-defined node shapes may lack proper ARIA labels
   - **Recommendation:** Ensure custom components include descriptive labels

---

## Browser & Assistive Technology Support

### Tested Browsers
- ✅ Chrome 120+
- ✅ Firefox 121+
- ⚠️ Safari 17+ (partial)
- ⚠️ Edge 120+ (partial)

### Tested Screen Readers
- ⚠️ NVDA (Windows) - Partial support
- ⚠️ JAWS (Windows) - Partial support
- ⚠️ VoiceOver (macOS/iOS) - Partial support

---

## Accessibility Best Practices for Users

### Keyboard Users
1. Use `Tab` to navigate between interactive elements
2. Use `Shift+Tab` to navigate backwards
3. Press `Enter` or `Space` to activate buttons
4. Use arrow keys in dialogs and menus

### Screen Reader Users
1. Enable screen reader before opening ORCA
2. Use landmarks to navigate major sections (Ctrl+)
3. Read form labels and helper text for input fields
4. Use keyboard shortcuts for common tasks

### Motor Accessibility
1. Ensure sufficient spacing between interactive elements (44px minimum)
2. Avoid time-limited interactions
3. Provide alternative input methods (currently: keyboard + mouse)

---

## Reporting Accessibility Issues

If you encounter an accessibility barrier or would like to provide feedback, please contact:

**Email:** accessibility@getupsoft.com  
**Issue Tracker:** [GitHub Issues](https://github.com/getupsoft/orca/issues)

When reporting, please include:
- Browser and assistive technology used
- Steps to reproduce the issue
- Expected vs. actual behavior
- Screenshots or video (if applicable)

---

## Accessibility Roadmap

### Q2 2026 (Current)
- ✅ WCAG 2.1 Level A compliance
- ✅ Keyboard navigation for all features
- ⏳ Screen reader testing and improvements

### Q3 2026
- Mobile/touch accessibility enhancements
- Canvas gesture alternatives
- Improved color contrast ratios
- Localization for accessibility features

### Q4 2026
- WCAG 2.1 Level AAA compliance target
- Advanced screen reader features
- Custom theme with accessibility profiles
- Accessibility audit by third party

---

## Conformance Level

**Current Status:** WCAG 2.1 Level A (Partial AA)

We are actively working to improve accessibility and welcome feedback from all users.

---

*This statement was last reviewed on 2026-05-22 and will be updated quarterly.*
