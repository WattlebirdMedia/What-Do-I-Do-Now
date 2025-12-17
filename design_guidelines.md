# Design Guidelines: "What Do I Do Now?"

## Design Approach
**Utility-Focused Minimalism**: This is a focus-enhancing productivity tool where calm and clarity are paramount. The design prioritizes cognitive ease and reduction of visual noise.

## Core Design Principles
1. **Maximum Calm**: Eliminate all sources of visual stimulation
2. **Radical Simplicity**: Show only what's needed at each moment
3. **Reading Comfort**: Optimize for easy scanning and comprehension
4. **Mobile-First**: Design for thumb-friendly single-handed use

## Typography
- **Primary Font**: System font stack (-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif)
- **Task Display**: Extra large (text-4xl to text-5xl), medium weight
- **Heading "Do this now"**: Large (text-2xl to text-3xl), regular weight
- **Input & Buttons**: Large touch targets (text-lg to text-xl)
- **Line Height**: Generous spacing (leading-relaxed) for readability

## Layout System
- **Spacing Units**: Use Tailwind spacing of 4, 6, 8, 12, 16 for consistent rhythm
- **Container**: Single centered column, max-w-md, full viewport height
- **Padding**: Generous internal spacing (p-8 on mobile, p-12 on larger screens)
- **Vertical Centering**: Content should feel balanced in viewport

## Component Library

### Task Input Screen
- Single text input field with large touch area
- Minimal border, subtle focus state
- Large "Add Task" button below input
- Empty state message: simple, reassuring text

### Task Display Screen
- Heading: "Do this now" (subtle, smaller text)
- Task text: Dominant, centered, breathing room above and below
- "Done" button: Full-width or prominent, easy to tap
- No progress indicators, no counters, no distractions

### Buttons
- Large touch targets (min-h-14)
- Rounded corners (rounded-lg)
- Clear label text
- Subtle hover states (no dramatic transitions)

## Color Palette (Neutral Tones)
Use grayscale with subtle warmth:
- **Background**: Off-white or light warm gray
- **Text**: Dark charcoal (not pure black)
- **Borders**: Very light gray
- **Buttons**: Medium gray with darker text
- **Focus States**: Slightly darker gray outline

## Interaction Design
- **No animations**: Instant state transitions
- **No transitions**: Direct, immediate feedback
- **No loading states**: Actions are synchronous
- **No celebrations**: Completing tasks is calm, not gamified

## Mobile Optimization
- Touch targets minimum 44x44px
- Thumb-friendly button placement (bottom half of screen)
- Single column layout at all breakpoints
- Font sizes scale appropriately (larger on mobile)

## Accessibility
- High contrast text (WCAG AA minimum)
- Clear focus indicators
- Semantic HTML structure
- Keyboard navigation support

## Images
**No images required** - This app is text-only for maximum simplicity and minimal distraction.