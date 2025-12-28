// Motion system barrel exports

// Core timing constants and utilities
export {
	PERFECT_DURATION_SECONDS,
	BRAND_DURATIONS,
	BRAND_EASING,
	calculateViewingTime,
	timeToScroll,
	scrollToTime,
	TARGET_SCROLL_DISTANCE,
	type BrandDuration,
	type BrandEasing,
	type ViewingComplexity
} from './timing';

// Scroll configuration
export {
	getDeviceScrollMultiplier,
	getScrollHeight,
	getScrollHeightVh,
	getDeviceType
} from './scroll-config';

// Scroll lerp utilities
export {
	createScrollLerp,
	type ScrollLerp,
	type ScrollLerpResult
} from './scroll-lerp';

// Section definitions and timing
export {
	SECTION_DEFINITIONS,
	sectionScrollRegions,
	calculateSectionDuration,
	deriveSectionScrollRegions,
	logSectionTimings,
	type SectionDefinition,
	type BeatDefinition,
	type SectionScrollRegion
} from './section-definitions';

// Timeline helpers
export {
	createSectionTimingHelpers,
	addBeatLifecycle,
	addFadeIn,
	addFadeOut,
	addZoom,
	type SectionTimingHelpers,
	type BeatLifecycleOptions
} from './timeline-helpers';

// Core motion modules - re-export all named exports
export * from './orchestrator';
export * from './gsapRegistry';
export * from './portalStore';
export * from './lensTimeline';
export * from './metadata';
export * from './sectionConfig';
