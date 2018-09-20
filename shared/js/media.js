/**
 * Video slides, declared with data-video
 * [data-times="N"] to play video N times and then pause
 * .looping for looping
 * <div class="annotation"> for annotations
 */

var $ = Bliss, $$ = $.$;

$.events(document, "slidechange", evt => {
	var slide = evt.target;

	// Create the videos for slides with a data-video attribute
	if (slide.matches(".slide[data-video]")) {
		if (!slide.matches(".initialized")) {
			// Initialization code
			let container = slide.classList.contains("cover")? slide : $.create("div", {
				className: "browser",
				inside: slide
			});

			let timedAnnotations = new Map();

			let video = $.create("video", {
				src: slide.getAttribute("data-video"),
				loop: slide.classList.contains("looping"),
				inside: container,
				events: {
					"click": evt => video[video.paused? "play" : "pause"](),
					"timeupdate": evt => {
						var currentMs = video.currentTime * 1000;

						for (let [annotation, times] of timedAnnotations.entries()) {
							if (currentMs >= times.start && currentMs < times.end && annotation.classList.contains("hidden")) {
								// Show annotation
								annotation.classList.remove("hidden");

								if (annotation.dataset.pause) {
									video.pause();
									setTimeout(() => video.play(), annotation.dataset.pause);
								}
							}
							else if (currentMs >= times.end && !annotation.classList.contains("hidden")) {
								// Hide annotation
								annotation.classList.add("hidden");
							}
						}
					},
					"play pause": evt => {
						evt.target.classList.toggle("paused", evt.type === "pause");
					},
					"ended": evt => {
						if (++video.iterations < slide.dataset.times) {
							video.currentTime = 0;
							video.play();
						}
					}
				}
			});

			for (let annotation of $$(".annotation", slide)) {
				container.append(annotation);

				if (annotation.dataset.time) {
					annotation.classList.add("hidden");
					let times = annotation.dataset.time.split(/\s*to\s*/);
					timedAnnotations.set(annotation, {start: +times[0], end: +times[1]});
				}
			}

			slide.classList.add("video", "initialized");
		}

		$$("video", slide).forEach(video => {
			video.muted = true;
			video.currentTime = 0;
			video.iterations = 0;

			video.play();
		});
	}

	$$(".slide:not(:target) video").forEach(video => {
		// Pause videos not in the current slide
		if (!video.paused && "#" + video.closest(".slide").id !== location.hash) {
			video.pause();
		}
	});
});