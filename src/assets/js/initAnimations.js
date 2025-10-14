import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";

export const initAnimations = () => {
  gsap.registerPlugin(ScrollTrigger, SplitText);

  const parallaxImages = document.querySelectorAll("[data-parallax-animate]");
  const makers = document.querySelector(".makers");

  parallaxImages.forEach((image) => {
    const sectionHeight = makers.clientHeight;

    const timeline = gsap.timeline({
      scrollTrigger: {
        trigger: ".makers",
        start: "top bottom",
        end: `center center`,
        scrub: 1,
      },
    });

    timeline.set(image, {
      scaleY: 1.1,
      yPercent: 5,
    });

    timeline.to(image, {
      yPercent: -5,
      duration: 1,
      ease: "power2.in",
    });
  });

  const videoParent = document.querySelector(".video")
    ? document.querySelector(".video")
    : document.querySelector(".challenge__video");

  if (videoParent) {
    const videoScale = videoParent.querySelector("video");
    const timelineVideo = gsap.timeline({
      scrollTrigger: {
        trigger: videoParent,
        start: "top bottom",
        end: `center center`,
        scrub: 2,
        onEnter: () => {
          videoScale.play();
        },
      },
    });
    timelineVideo.from(videoScale, {
      scale: 0.5,
      duration: 1.5,
      ease: "power2.in",
    });
  }

  const splitDropContent = document.querySelectorAll("[data-split-text]");
  splitDropContent.forEach((content) => {
    const split = new SplitText(content, {
      type: "chars,lines",
      linesClass: "split-lines",
    });

    const parentSection = content.closest("section");

    gsap.set(split.chars, { yPercent: -100 });

    const timeline = gsap.timeline({
      scrollTrigger: {
        trigger: parentSection,
        start: "top 70%",
        end: "bottom 10%",
        toggleActions: "play reverse play reverse",
      },
    });

    timeline.to(split.chars, {
      yPercent: 0,
      duration: 0.5,
      ease: "power2.out",
      stagger: 0.02,
    });
  });

  const splitRecolorContent = document.querySelectorAll("[data-split-recolor]");
  splitRecolorContent.forEach((content) => {
    const split = new SplitText(content, {
      type: "chars,lines",
      linesClass: "split-lines",
    });

    const parentSection = content.closest("section");

    gsap.set(split.chars, { color: "#7E7E7E" });

    const timeline = gsap.timeline({
      scrollTrigger: {
        trigger: parentSection,
        start: "top 30%",
        end: "center center",
        toggleActions: "play none play none",
      },
    });

    timeline.to(split.chars, {
      color: "#FFF",
      duration: 1,
      ease: "steps(1)",
      stagger: 0.05,
    });
  });

  const imageAnimate = document.querySelectorAll("[data-image-animate]");
  imageAnimate.forEach((image) => {
    const parentSection = image.closest("section");
    const timeline = gsap.timeline({
      scrollTrigger: {
        trigger: image,
        start: "10% 60%",
        end: "bottom 10%",
        toggleActions: "play reverse play reverse",
      },
    });

    timeline.from(image, {
      clipPath: "inset(0 0 100% 0)",
      duration: 1,
      ease: "power2.inOut",
      delay: gsap.utils.random(0, 0.5),
    });
  });

  const pathLine = document.querySelector(".path__progress-line");
  const pathContainer = document.querySelector(".path__main");

  if (pathLine) {
    const timeline = gsap.timeline({
      scrollTrigger: {
        trigger: pathContainer,
        start: "top bottom",
        end: "bottom 30%",
        scrub: 1,
      },
    });
    timeline.to(pathLine, {
      height: "100%",
      duration: 1,
      ease: "power2.inOut",
    });

    const pathSteps = document.querySelectorAll(".path__item");
    pathSteps.forEach((step) => {
      gsap.timeline({
        scrollTrigger: {
          trigger: step,
          start: "top 70%",
          onEnter: () => {
            step.classList.add("is-visible");
          },
          onLeaveBack: () => {
            step.classList.remove("is-visible");
          },
        },
      });
    });
  }
};
