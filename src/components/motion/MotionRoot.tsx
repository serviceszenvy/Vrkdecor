"use client";

import { useEffect } from "react";

/**
 * One client component drives the whole motion system so every page and
 * section can stay a server component. Behaviours are attached by data
 * attribute and all of them are skipped when the visitor prefers reduced
 * motion.
 *
 *   data-reveal="up|left|right|scale"   scroll-in reveal (stagger via --i)
 *   data-magnetic                        pointer-attracted button
 *   data-tilt                            3D tilt on pointer move
 *   data-countup="600"                   animated number
 *   data-cursor-glow                     pointer-following brand glow
 */
export default function MotionRoot() {
  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    /* ---------- scroll reveals (always on, fades only when reduced) ---- */
    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-in");
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 }
    );

    const countObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const el = entry.target as HTMLElement;
          countObserver.unobserve(el);
          if (el.dataset.counted === "true") return;
          el.dataset.counted = "true";
          const target = Number(el.dataset.countup || "0");
          if (reduced) {
            el.textContent = String(target);
            return;
          }
          const duration = 1500;
          const start = performance.now();
          const tick = (now: number) => {
            const p = Math.min((now - start) / duration, 1);
            const eased = 1 - Math.pow(1 - p, 3);
            el.textContent = String(Math.round(target * eased));
            if (p < 1) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
        });
      },
      { threshold: 0.4 }
    );

    const scan = () => {
      document.querySelectorAll("[data-reveal]:not(.is-in)").forEach((el) => revealObserver.observe(el));
      document.querySelectorAll("[data-countup]:not([data-counted])").forEach((el) => countObserver.observe(el));
    };
    scan();

    const mutation = new MutationObserver(scan);
    mutation.observe(document.body, { childList: true, subtree: true });

    /* ---------- pointer behaviours (desktop, motion allowed only) ------ */
    const fine = window.matchMedia("(pointer: fine)").matches;
    const cleanups: Array<() => void> = [];

    if (!reduced && fine) {
      document.querySelectorAll<HTMLElement>("[data-magnetic]").forEach((el) => {
        const strength = Number(el.dataset.magnetic || "0.28");
        const move = (e: MouseEvent) => {
          const r = el.getBoundingClientRect();
          const x = (e.clientX - (r.left + r.width / 2)) * strength;
          const y = (e.clientY - (r.top + r.height / 2)) * strength;
          el.style.transform = `translate3d(${x}px, ${y}px, 0)`;
        };
        const leave = () => {
          el.style.transform = "translate3d(0,0,0)";
        };
        el.addEventListener("mousemove", move);
        el.addEventListener("mouseleave", leave);
        cleanups.push(() => {
          el.removeEventListener("mousemove", move);
          el.removeEventListener("mouseleave", leave);
        });
      });

      document.querySelectorAll<HTMLElement>("[data-tilt]").forEach((el) => {
        const max = Number(el.dataset.tilt || "7");
        const move = (e: MouseEvent) => {
          const r = el.getBoundingClientRect();
          const px = (e.clientX - r.left) / r.width - 0.5;
          const py = (e.clientY - r.top) / r.height - 0.5;
          el.style.transform = `perspective(900px) rotateX(${(-py * max).toFixed(2)}deg) rotateY(${(px * max).toFixed(2)}deg) translateY(-6px)`;
        };
        const leave = () => {
          el.style.transform = "perspective(900px) rotateX(0deg) rotateY(0deg)";
        };
        el.addEventListener("mousemove", move);
        el.addEventListener("mouseleave", leave);
        cleanups.push(() => {
          el.removeEventListener("mousemove", move);
          el.removeEventListener("mouseleave", leave);
        });
      });

      const glow = document.querySelector<HTMLElement>("[data-cursor-glow]");
      if (glow) {
        let raf = 0;
        const onMove = (e: MouseEvent) => {
          cancelAnimationFrame(raf);
          raf = requestAnimationFrame(() => {
            glow.style.transform = `translate3d(${e.clientX - 260}px, ${e.clientY - 260}px, 0)`;
          });
        };
        window.addEventListener("mousemove", onMove, { passive: true });
        cleanups.push(() => window.removeEventListener("mousemove", onMove));
      }

      /* ---------- hero parallax on pointer ---------------------------- */
      document.querySelectorAll<HTMLElement>("[data-parallax]").forEach((el) => {
        const depth = Number(el.dataset.parallax || "12");
        const onMove = (e: MouseEvent) => {
          const x = (e.clientX / window.innerWidth - 0.5) * depth;
          const y = (e.clientY / window.innerHeight - 0.5) * depth;
          el.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)`;
        };
        window.addEventListener("mousemove", onMove, { passive: true });
        cleanups.push(() => window.removeEventListener("mousemove", onMove));
      });
    }

    /* ---------- scroll-aware header ------------------------------------ */
    const onScroll = () => {
      document.documentElement.dataset.scrolled = window.scrollY > 24 ? "true" : "false";
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    cleanups.push(() => window.removeEventListener("scroll", onScroll));

    return () => {
      revealObserver.disconnect();
      countObserver.disconnect();
      mutation.disconnect();
      cleanups.forEach((fn) => fn());
    };
  }, []);

  return null;
}
