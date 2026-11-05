const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => document.querySelectorAll(selector);
const closingDialogs = new WeakSet();
async function softCloseDialog(dialog) {
    if (!dialog.open || closingDialogs.has(dialog)) return;
    closingDialogs.add(dialog);
    if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        dialog.classList.add("is-soft-closing");
        const fade = dialog.animate(
            [{ opacity: 1, translate: "0 0" }, { opacity: 0, translate: "0 8px" }],
            { duration: 220, easing: "cubic-bezier(0.4, 0, 1, 1)", fill: "forwards" },
        );
        await fade.finished.catch(() => {});
        dialog.close();
        fade.cancel();
    } else {
        dialog.close();
    }
    dialog.classList.remove("is-soft-closing");
    closingDialogs.delete(dialog);
}
if ($(".name-line")) {
    const nameLine = $(".name-line");
    const typingPreference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const nameVariants = ["AMBER", "BER", "AMBER KAIA", "KAIA"];
    nameLine.innerHTML =
        '<span class="name-reserve">AMBER KAIA</span><span class="rotating-name"></span>';
    const rotatingName = nameLine.querySelector(".rotating-name");
    let nameTypingTimer;
    let nameIndex = 0;
    let nameCharacter = 0;
    let deletingName = false;
    const animateName = () => {
        if (typingPreference.matches || document.hidden) return;
        const word = nameVariants[nameIndex];
        nameCharacter += deletingName ? -1 : 1;
        rotatingName.textContent = word.slice(0, nameCharacter);
        let delay = deletingName ? 75 : 145;
        if (!deletingName && nameCharacter === word.length) {
            deletingName = true;
            delay = 2100;
        } else if (deletingName && nameCharacter === 0) {
            deletingName = false;
            nameIndex = (nameIndex + 1) % nameVariants.length;
            delay = 350;
        }
        nameTypingTimer = setTimeout(animateName, delay);
    };
    const resetNameMotion = () => {
        clearTimeout(nameTypingTimer);
        nameLine.classList.toggle("has-rotating-name", !typingPreference.matches);
        if (typingPreference.matches) rotatingName.textContent = "AMBER KAIA";
        else if (!document.hidden) {
            nameIndex = 0;
            nameCharacter = 0;
            deletingName = false;
            rotatingName.textContent = "";
            nameTypingTimer = setTimeout(animateName, 400);
        }
    };
    resetNameMotion();
    typingPreference.addEventListener("change", resetNameMotion);
    document.addEventListener("visibilitychange", resetNameMotion);
    const mobileHeroLayout = window.matchMedia("(max-width: 700px)");
    const filmStrip = $("#film");
    const positionFilmStrip = () => {
        if (mobileHeroLayout.matches) {
            $(".hero-sub").before(filmStrip);
        } else {
            $(".floating-sticker").before(filmStrip);
        }
    };
    positionFilmStrip();
    mobileHeroLayout.addEventListener("change", positionFilmStrip);
}
const certificateMotion = window.matchMedia("(hover: hover) and (prefers-reduced-motion: no-preference)");
if ($(".certificate-gallery")) {
    const previewDialog = document.createElement("dialog");
    previewDialog.className = "certificate-dialog";
    previewDialog.setAttribute("aria-labelledby", "certificate-dialog-title");
    previewDialog.innerHTML = '<div class="certificate-dialog-bar"><div><span class="certificate-dialog-eyebrow">CERTIFICATE OF ACHIEVEMENT</span><h2 id="certificate-dialog-title"></h2></div><button type="button" class="certificate-dialog-close" aria-label="Close certificate preview">×</button></div><div class="certificate-dialog-image"><img alt="" /></div>';
    document.body.append(previewDialog);
    const previewImage = previewDialog.querySelector("img");
    const previewTitle = previewDialog.querySelector("h2");
    const previewEyebrow = previewDialog.querySelector(".certificate-dialog-eyebrow");
    let previewTrigger;
    let closingPreview = false;
    const closePreview = async () => {
        if (closingPreview || !previewDialog.open) return;
        closingPreview = true;
        if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
            previewDialog.classList.add("is-closing");
            await Promise.allSettled(
                previewDialog.getAnimations().map((animation) => animation.finished),
            );
        }
        previewDialog.close();
        previewDialog.classList.remove("is-closing");
        closingPreview = false;
    };
    previewDialog.addEventListener("cancel", (event) => {
        event.preventDefault();
        closePreview();
    });
    previewDialog.querySelector("button").addEventListener("click", closePreview);
    previewDialog.addEventListener("click", (event) => {
        if (event.target !== previewDialog) return;
        const box = previewDialog.getBoundingClientRect();
        if (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom) closePreview();
    });
    previewDialog.addEventListener("close", () => {
        document.documentElement.classList.remove("certificate-preview-open");
        previewTrigger?.focus({ preventScroll: true });
    });
    $$(".certificate-card").forEach((card) => {
        const link = card.querySelector("a.certificate-preview");
        const image = link?.querySelector("img");
        if (!link || !image) return;
        link.setAttribute("aria-haspopup", "dialog");
        card.addEventListener("click", (event) => {
            if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
            event.preventDefault();
            previewTrigger = link;
            previewTitle.textContent = card.querySelector("h3").textContent;
            previewEyebrow.textContent = `${card.querySelector(".muted").textContent} · CERTIFICATE`;
            previewImage.src = image.src;
            previewImage.alt = image.alt;
            document.documentElement.classList.add("certificate-preview-open");
            const cursorLabel = $(".badge-cursor-label");
            if (cursorLabel) cursorLabel.hidden = true;
            card.dispatchEvent(new Event("pointerleave"));
            previewDialog.showModal();
        });
    });
}
$$(".certificate-card").forEach((card) => {
    const resetTilt = () => {
        card.classList.remove("is-tilting");
        ["--card-rx", "--card-ry", "--card-light-x", "--card-light-y"].forEach((name) => card.style.removeProperty(name));
    };
    card.addEventListener("pointermove", (event) => {
        if (event.pointerType !== "mouse" || !certificateMotion.matches) return;
        const box = card.getBoundingClientRect();
        const x = Math.max(0, Math.min(1, (event.clientX - box.left) / box.width));
        const y = Math.max(0, Math.min(1, (event.clientY - box.top) / box.height));
        card.style.setProperty("--card-rx", `${(0.5 - y) * 10}deg`);
        card.style.setProperty("--card-ry", `${(x - 0.5) * 10}deg`);
        card.style.setProperty("--card-light-x", `${x * 100}%`);
        card.style.setProperty("--card-light-y", `${y * 100}%`);
        card.classList.add("is-tilting");
    });
    card.addEventListener("pointerleave", resetTilt);
    card.addEventListener("pointercancel", resetTilt);
    window.addEventListener("blur", resetTilt);
    certificateMotion.addEventListener("change", resetTilt);
});
if ($("a.floppy-disk")) {
    const projectCursorLabel = document.createElement("div");
    projectCursorLabel.className = "badge-cursor-label";
    projectCursorLabel.textContent = "Click to view";
    projectCursorLabel.hidden = true;
    projectCursorLabel.setAttribute("aria-hidden", "true");
    document.body.append(projectCursorLabel);
    const hideProjectCursorLabel = () => { projectCursorLabel.hidden = true; };
    document.addEventListener("pointermove", (event) => {
        const disk = event.target.closest("a.floppy-disk");
        projectCursorLabel.hidden = event.pointerType !== "mouse" || !disk;
        if (projectCursorLabel.hidden) return;
        projectCursorLabel.style.left = `${Math.max(8, Math.min(event.clientX + 16, window.innerWidth - projectCursorLabel.offsetWidth - 8))}px`;
        projectCursorLabel.style.top = `${Math.max(8, Math.min(event.clientY + 18, window.innerHeight - projectCursorLabel.offsetHeight - 8))}px`;
    });
    document.addEventListener("pointerleave", hideProjectCursorLabel);
    document.addEventListener("pointerdown", hideProjectCursorLabel);
    window.addEventListener("scroll", hideProjectCursorLabel, true);
    window.addEventListener("blur", hideProjectCursorLabel);
}
if ($("#badge-track")) {
    const badgeTrack = $("#badge-track");
    const badgeCursorLabel = document.createElement("div");
    badgeCursorLabel.className = "badge-cursor-label";
    badgeCursorLabel.textContent = "Click to verify";
    badgeCursorLabel.hidden = true;
    badgeCursorLabel.setAttribute("aria-hidden", "true");
    document.body.append(badgeCursorLabel);
    document.addEventListener("pointermove", (event) => {
        const certificate = event.target.closest(".certificate-card");
        const showLabel = !document.documentElement.classList.contains("certificate-preview-open") && event.pointerType === "mouse" && (certificate || event.target.closest(".badge-tile"));
        badgeCursorLabel.hidden = !showLabel;
        if (!showLabel) return;
        badgeCursorLabel.textContent = certificate ? "Click to view" : "Click to verify";
        badgeCursorLabel.style.left = `${Math.max(8, Math.min(event.clientX + 16, window.innerWidth - badgeCursorLabel.offsetWidth - 8))}px`;
        badgeCursorLabel.style.top = `${Math.max(8, Math.min(event.clientY + 18, window.innerHeight - badgeCursorLabel.offsetHeight - 8))}px`;
    });
    const hideBadgeCursorLabel = () => { badgeCursorLabel.hidden = true; };
    badgeTrack.addEventListener("pointerleave", hideBadgeCursorLabel);
    window.addEventListener("blur", hideBadgeCursorLabel);
    window.addEventListener("scroll", hideBadgeCursorLabel, true);
    const scrollBadges = (direction) =>
        badgeTrack.scrollBy({
            left: direction * (badgeTrack.querySelector(".badge-tile").offsetWidth + 20),
            behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
                ? "auto"
                : "smooth",
        });
    $("#badges-prev").addEventListener("click", () => scrollBadges(-1));
    $("#badges-next").addEventListener("click", () => scrollBadges(1));
    const updateBadgeControls = () => {
        $("#badges-prev").disabled = badgeTrack.scrollLeft <= 2;
        $("#badges-next").disabled =
            badgeTrack.scrollLeft + badgeTrack.clientWidth >= badgeTrack.scrollWidth - 2;
    };
    badgeTrack.addEventListener("scroll", updateBadgeControls, { passive: true });
    window.addEventListener("resize", updateBadgeControls);
    updateBadgeControls();
}
if ($("#song-track")) {
    const songTrack = $("#song-track");
    const songDots = Array.from($$(".song-dots button"));
    const songSlides = Array.from($$(".song-slide"));
    songSlides[0].classList.add("is-current-song");
    const songStep = () =>
        songTrack.querySelector(".song-slide").offsetWidth +
        parseFloat(getComputedStyle(songTrack).columnGap);
    songDots.forEach((dot, index) =>
        dot.addEventListener("click", () =>
            songTrack.scrollTo({
                left: index * songStep(),
                behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
                    ? "auto"
                    : "smooth",
            }),
        ),
    );
    songSlides.forEach((slide, index) =>
        slide.addEventListener("click", (event) => {
            if (!slide.classList.contains("is-current-song")) {
                event.preventDefault();
                songDots[index].click();
            }
        }),
    );
    let vinylDrag = null;
    let vinylWasDragged = false;
    songTrack.addEventListener("dragstart", (event) => event.preventDefault());
    songTrack.addEventListener("pointerdown", (event) => {
        if (event.pointerType !== "mouse" || event.button !== 0) return;
        vinylDrag = { x: event.clientX, scroll: songTrack.scrollLeft };
        vinylWasDragged = false;
    });
    window.addEventListener("pointermove", (event) => {
        if (!vinylDrag) return;
        const distance = event.clientX - vinylDrag.x;
        if (Math.abs(distance) > 5) {
            vinylWasDragged = true;
            songTrack.classList.add("is-dragging");
            songTrack.scrollLeft = vinylDrag.scroll - distance;
        }
    });
    const endVinylDrag = () => {
        if (!vinylDrag) return;
        const shouldSnap = vinylWasDragged;
        vinylDrag = null;
        songTrack.classList.remove("is-dragging");
        if (shouldSnap) {
            const index = Math.min(
                songSlides.length - 1,
                Math.max(0, Math.round(songTrack.scrollLeft / songStep())),
            );
            songDots[index].click();
        }
    };
    window.addEventListener("pointerup", endVinylDrag);
    window.addEventListener("pointercancel", endVinylDrag);
    songTrack.addEventListener(
        "click",
        (event) => {
            if (vinylWasDragged) {
                event.preventDefault();
                vinylWasDragged = false;
            }
        },
        true,
    );
    $$(".vinyl-window").forEach((surface) => {
        const record = surface.querySelector(".vinyl-record");
        let spin = null;
        const angleAt = (event) => {
            const box = surface.getBoundingClientRect();
            return (
                (Math.atan2(
                    event.clientY - box.top - box.height / 2,
                    event.clientX - box.left - box.width / 2,
                ) *
                    180) /
                Math.PI
            );
        };
        surface.addEventListener("pointerdown", (event) => {
            if (event.button !== 0) return;
            event.stopPropagation();
            vinylWasDragged = false;
            const animation = record
                .getAnimations()
                .find((item) => item.animationName === "vinyl-spin");
            if (animation) animation.pause();
            spin = {
                angle: angleAt(event),
                animation,
                moved: 0,
                rotation: Number(record.dataset.rotation || 0),
            };
            surface.setPointerCapture(event.pointerId);
            surface.classList.add("is-spinning");
        });
        surface.addEventListener("pointermove", (event) => {
            if (!spin) return;
            const angle = angleAt(event);
            let delta = angle - spin.angle;
            if (delta > 180) delta -= 360;
            if (delta < -180) delta += 360;
            spin.angle = angle;
            spin.moved += Math.abs(delta);
            if (spin.moved > 4) vinylWasDragged = true;
            if (spin.animation) {
                const duration = Number(spin.animation.effect.getTiming().duration);
                spin.animation.currentTime =
                    ((((Number(spin.animation.currentTime) || 0) + (delta / 360) * duration) %
                        duration) +
                        duration) %
                    duration;
            } else {
                spin.rotation += delta;
                record.style.transform = `rotate(${spin.rotation}deg)`;
                record.dataset.rotation = spin.rotation;
            }
        });
        const releaseSpin = () => {
            if (!spin) return;
            if (spin.animation) spin.animation.play();
            spin = null;
            surface.classList.remove("is-spinning");
        };
        surface.addEventListener("pointerup", releaseSpin);
        surface.addEventListener("pointercancel", releaseSpin);
        surface.addEventListener("lostpointercapture", releaseSpin);
    });
    songTrack.addEventListener(
        "scroll",
        () => {
            const end = songTrack.scrollLeft + songTrack.clientWidth >= songTrack.scrollWidth - 2;
            const current = end
                ? songDots.length - 1
                : Math.round(songTrack.scrollLeft / songStep());
            songDots.forEach((dot, index) =>
                dot.setAttribute("aria-pressed", String(index === current)),
            );
            songSlides.forEach((slide, index) =>
                slide.classList.toggle("is-current-song", index === current),
            );
        },
        { passive: true },
    );
}
$$(".tool-rail").forEach((rail) => {
    const list = rail.querySelector(".skill-tiles");
    list.tabIndex = 0;
    list.setAttribute("aria-label", "Tools carousel");
    let target = 0;
    let frame = null;
    const motion = window.matchMedia(
        "(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)",
    );
    rail.querySelectorAll(".skill-tile").forEach((tile) => {
        let toolTiltFrame = null;
        const clearToolTilt = () => {
            cancelAnimationFrame(toolTiltFrame);
            tile.classList.remove("tool-is-tilting");
            tile.style.removeProperty("--tool-rotate-x");
            tile.style.removeProperty("--tool-rotate-y");
        };
        tile.addEventListener("pointermove", (event) => {
            if (!motion.matches || event.pointerType !== "mouse") return;
            cancelAnimationFrame(toolTiltFrame);
            const x = event.clientX;
            const y = event.clientY;
            toolTiltFrame = requestAnimationFrame(() => {
                const bounds = tile.getBoundingClientRect();
                const horizontal = Math.max(0, Math.min(1, (x - bounds.left) / bounds.width));
                const vertical = Math.max(0, Math.min(1, (y - bounds.top) / bounds.height));
                tile.style.setProperty("--tool-rotate-x", `${(0.5 - vertical) * 12}deg`);
                tile.style.setProperty("--tool-rotate-y", `${(horizontal - 0.5) * 14}deg`);
                tile.style.setProperty("--tool-reflect-x", `${horizontal * 100}%`);
                tile.style.setProperty("--tool-reflect-y", `${vertical * 100}%`);
                tile.classList.add("tool-is-tilting");
            });
        });
        tile.addEventListener("pointerleave", clearToolTilt);
        tile.addEventListener("pointercancel", clearToolTilt);
        motion.addEventListener("change", clearToolTilt);
    });
    const stop = () => {
        cancelAnimationFrame(frame);
        frame = null;
    };
    const glide = () => {
        const delta = target - list.scrollLeft;
        if (Math.abs(delta) < 0.8) {
            list.scrollLeft = target;
            frame = null;
            return;
        }
        list.scrollLeft += Math.sign(delta) * Math.min(Math.abs(delta) * 0.02, 2);
        frame = requestAnimationFrame(glide);
    };
    list.addEventListener("pointermove", (event) => {
        if (event.pointerType !== "mouse" || !motion.matches) return;
        const bounds = list.getBoundingClientRect();
        const surface = rail.closest(".skills-unified");
        if (surface) {
            const surfaceBounds = surface.getBoundingClientRect();
            surface.style.setProperty("--tool-light-x", `${event.clientX - surfaceBounds.left}px`);
            surface.style.setProperty("--tool-light-y", `${event.clientY - surfaceBounds.top}px`);
        }
        const position = Math.max(
            0,
            Math.min(1, (event.clientX - bounds.left - bounds.width * 0.1) / (bounds.width * 0.8)),
        );
        target = position * (list.scrollWidth - list.clientWidth);
        if (frame === null) frame = requestAnimationFrame(glide);
    });
    list.addEventListener("pointerleave", stop);
    list.addEventListener("pointerdown", stop);
    list.addEventListener("keydown", stop);
    motion.addEventListener("change", stop);
    const mobileAutoplay = window.matchMedia(
        "(max-width: 700px) and (prefers-reduced-motion: no-preference)",
    );
    let autoFrame = null;
    let lastAutoTime = 0;
    let autoDirection = 1;
    let touchingTools = false;
    let resumeToolsAt = 0;
    let toolsVisible = false;
    const stopAutoTools = () => {
        cancelAnimationFrame(autoFrame);
        autoFrame = null;
        lastAutoTime = 0;
    };
    const animateTools = (timestamp) => {
        if (!mobileAutoplay.matches || !toolsVisible || document.hidden) {
            stopAutoTools();
            return;
        }
        const elapsed = lastAutoTime ? Math.min(timestamp - lastAutoTime, 50) : 0;
        lastAutoTime = timestamp;
        const max = list.scrollWidth - list.clientWidth;
        if (!touchingTools && timestamp > resumeToolsAt && max > 1) {
            list.scrollLeft += autoDirection * elapsed * 0.022;
            if (list.scrollLeft >= max - 1) autoDirection = -1;
            if (list.scrollLeft <= 1) autoDirection = 1;
        }
        autoFrame = requestAnimationFrame(animateTools);
    };
    const startAutoTools = () => {
        if (autoFrame === null && mobileAutoplay.matches && toolsVisible && !document.hidden)
            autoFrame = requestAnimationFrame(animateTools);
    };
    list.addEventListener("pointerdown", () => {
        touchingTools = true;
    });
    const releaseTools = () => {
        touchingTools = false;
        resumeToolsAt = performance.now() + 2500;
    };
    window.addEventListener("pointerup", releaseTools, { passive: true });
    window.addEventListener("pointercancel", releaseTools, { passive: true });
    list.addEventListener("focusin", () => {
        touchingTools = true;
    });
    list.addEventListener("focusout", releaseTools);
    mobileAutoplay.addEventListener("change", () => {
        stopAutoTools();
        startAutoTools();
    });
    document.addEventListener("visibilitychange", () => {
        stopAutoTools();
        startAutoTools();
    });
    if ("IntersectionObserver" in window) {
        new IntersectionObserver((entries) => {
            toolsVisible = entries[0].isIntersecting;
            if (toolsVisible) startAutoTools();
            else stopAutoTools();
        }).observe(list);
    }

    $$(".tool-filters button").forEach((button) =>
        button.addEventListener("click", () => {
            stop();
            $$(".tool-filters button").forEach((filter) =>
                filter.setAttribute("aria-pressed", String(filter === button)),
            );
            list.querySelectorAll(".skill-tile").forEach((tile) => {
                tile.hidden =
                    button.dataset.filter !== "all" &&
                    tile.dataset.category !== button.dataset.filter;
            });
            list.scrollTo({ left: 0, behavior: "instant" });
        }),
    );
});
if ($(".connect-letter-dialog") && $(".contact-envelope")) {
    const letterDialog = $(".connect-letter-dialog");
    const envelopeTrigger = $(".contact-envelope");
    const letterHover = window.matchMedia("(hover: hover) and (pointer: fine)");
    let letterFlightTimer;
    let hoverLetter = false;
    const closeLetter = () => softCloseDialog(letterDialog);
    letterDialog.addEventListener("cancel", (event) => {
        event.preventDefault();
        closeLetter();
    });
    const showHoverLetter = () => {
        if (!letterHover.matches) return;
        clearTimeout(letterFlightTimer);
        hoverLetter = true;
        letterDialog.classList.add("is-hover-letter");
        letterDialog.classList.remove("is-flying");
        if (!letterDialog.open) letterDialog.show();
        document.body.classList.add("letter-is-open");
    };
    const flyLetter = () => {
        if (!hoverLetter || !letterDialog.open) return;
        letterDialog.classList.add("is-flying");
        document.body.classList.remove("letter-is-open");
        clearTimeout(letterFlightTimer);
        letterFlightTimer = setTimeout(
            closeLetter,
            window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 4600,
        );
    };
    envelopeTrigger.addEventListener("pointerenter", showHoverLetter);
    envelopeTrigger.addEventListener("pointerleave", flyLetter);
    envelopeTrigger.addEventListener("click", () => {
        if (letterHover.matches) return;
        hoverLetter = false;
        letterDialog.classList.remove("is-hover-letter");
        if (!letterDialog.open) letterDialog.showModal();
        document.body.classList.add("letter-is-open");
    });
    $(".letter-close").addEventListener("click", closeLetter);
    letterDialog.addEventListener("click", (event) => {
        if (event.target === letterDialog) closeLetter();
    });
    letterDialog.addEventListener("close", () => {
        clearTimeout(letterFlightTimer);
        letterDialog.classList.remove("is-flying", "is-hover-letter");
        document.body.classList.remove("letter-is-open");
        if (!hoverLetter) envelopeTrigger.focus({ preventScroll: true });
        hoverLetter = false;
    });
}
const menu = $("#menu");
const navLinks = $("#navlinks");
const mobileNavigation = window.matchMedia("(max-width: 700px)");
const menuLabel = document.createElement("span");
menuLabel.className = "mobile-menu-label";
menuLabel.textContent = "Menu";
menu.prepend(menuLabel);
const syncMobileNavigation = () => {
    const expanded = menu.getAttribute("aria-expanded") === "true";
    menuLabel.textContent = expanded ? "Close" : "Menu";
    menu.setAttribute("aria-label", expanded ? "Close navigation" : "Open navigation");
    navLinks.inert = mobileNavigation.matches && !expanded;
};
new MutationObserver(syncMobileNavigation).observe(menu, {
    attributes: true,
    attributeFilter: ["aria-expanded"],
});
mobileNavigation.addEventListener("change", syncMobileNavigation);
syncMobileNavigation();
menu.addEventListener("click", () => {
    menu.setAttribute("aria-expanded", navLinks.classList.toggle("show"));
});
document.addEventListener("pointerdown", (event) => {
    if (!event.target.closest("nav")) {
        navLinks.classList.remove("show");
        menu.setAttribute("aria-expanded", "false");
    }
});
window.matchMedia("(max-width: 700px)").addEventListener("change", () => {
    navLinks.classList.remove("show");
    menu.setAttribute("aria-expanded", "false");
});
$$(".nav-links a").forEach((link) =>
    link.addEventListener("click", () => {
        navLinks.classList.remove("show");
        menu.setAttribute("aria-expanded", "false");
    }),
);

if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add("in");
                    observer.unobserve(entry.target);
                }
            });
        },
        { threshold: 0.08 },
    );
    $$(".reveal").forEach((element) => observer.observe(element));
} else {
    $$(".reveal").forEach((element) => element.classList.add("in"));
}

const progress = $("#progress");
const navbar = $("nav");
const updateActiveSection = () => {
    navbar.classList.toggle("is-scrolled", window.scrollY > 48);
};
updateActiveSection();
window.addEventListener(
    "scroll",
    () => {
        const height = document.documentElement.scrollHeight - innerHeight;
        progress.style.width = `${height > 0 ? (100 * scrollY) / height : 0}%`;
        updateActiveSection();
    },
    { passive: true },
);
const halo = $("#halo");
const cursorEffects = window.matchMedia(
    "(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)",
);
window.addEventListener(
    "pointermove",
    (event) => {
        if (event.pointerType !== "mouse" || !cursorEffects.matches) return;
        halo.style.opacity = "1";
        halo.style.left = `${event.clientX}px`;
        halo.style.top = `${event.clientY}px`;
        halo.classList.toggle(
            "is-hovering",
            Boolean(event.target.closest('a, button, [role="button"]')),
        );
    },
    { passive: true },
);
const hideCursorEffect = () => {
    halo.style.opacity = "0";
};
document.documentElement.addEventListener("pointerleave", hideCursorEffect);
window.addEventListener("blur", hideCursorEffect);
cursorEffects.addEventListener("change", hideCursorEffect);

if ($("#project-slides")) {
    const projectSlides = $("#project-slides");
    const slideStep = () =>
        projectSlides.querySelector(".project-slide").offsetWidth +
        parseFloat(getComputedStyle(projectSlides).columnGap);
    const projectDots = Array.from($$(".project-dot"));
    const projectCards = Array.from($$(".project-slide"));
    projectDots.forEach((dot) =>
        dot.addEventListener("click", () => {
            projectSlides.scrollTo({
                left: Number(dot.dataset.slide) * slideStep(),
                behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
                    ? "auto"
                    : "smooth",
            });
        }),
    );
    projectCards.forEach((slide, index) => {
        slide.addEventListener("click", (event) => {
            if (event.target.closest("a, button")) return;
            if (!slide.classList.contains("is-active")) projectDots[index].click();
        });
    });
    let projectDrag = null;
    let projectWasDragged = false;
    projectSlides.addEventListener("dragstart", (event) => event.preventDefault());
    projectSlides.addEventListener("pointerdown", (event) => {
        if (event.pointerType !== "mouse" || event.button !== 0) return;
        projectWasDragged = false;
        projectDrag = { x: event.clientX, scroll: projectSlides.scrollLeft, id: event.pointerId };
    });
    projectSlides.addEventListener("pointermove", (event) => {
        if (!projectDrag) return;
        const distance = event.clientX - projectDrag.x;
        if (Math.abs(distance) > 5) {
            projectWasDragged = true;
            projectSlides.classList.add("is-dragging-projects");
            if (!projectSlides.hasPointerCapture(event.pointerId))
                projectSlides.setPointerCapture(event.pointerId);
            projectSlides.scrollLeft = projectDrag.scroll - distance;
            event.preventDefault();
        }
    });
    const finishProjectDrag = () => {
        if (!projectDrag) return;
        const pointerId = projectDrag.id;
        projectDrag = null;
        projectSlides.classList.remove("is-dragging-projects");
        if (projectSlides.hasPointerCapture(pointerId))
            projectSlides.releasePointerCapture(pointerId);
        if (projectWasDragged) {
            const index = Math.max(
                0,
                Math.min(
                    projectDots.length - 1,
                    Math.round(projectSlides.scrollLeft / slideStep()),
                ),
            );
            projectDots[index].click();
        }
    };
    window.addEventListener("pointerup", finishProjectDrag);
    window.addEventListener("pointercancel", finishProjectDrag);
    projectSlides.addEventListener("lostpointercapture", finishProjectDrag);
    projectSlides.addEventListener(
        "click",
        (event) => {
            if (projectWasDragged) {
                event.preventDefault();
                event.stopPropagation();
                projectWasDragged = false;
            }
        },
        true,
    );
    const diskMotion = window.matchMedia(
        "(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)",
    );
    $$(".floppy-disk").forEach((disk) => {
        let tiltFrame = null;
        const resetTilt = () => {
            cancelAnimationFrame(tiltFrame);
            tiltFrame = null;
            disk.classList.remove("is-tilting");
            disk.style.removeProperty("--tilt-x");
            disk.style.removeProperty("--tilt-y");
        };
        disk.addEventListener("pointermove", (event) => {
            if (event.pointerType !== "mouse" || !diskMotion.matches) return;
            cancelAnimationFrame(tiltFrame);
            const x = event.clientX;
            const y = event.clientY;
            tiltFrame = requestAnimationFrame(() => {
                const bounds = disk.getBoundingClientRect();
                const horizontal = Math.max(0, Math.min(1, (x - bounds.left) / bounds.width));
                const vertical = Math.max(0, Math.min(1, (y - bounds.top) / bounds.height));
                disk.classList.add("is-tilting");
                disk.style.setProperty("--tilt-x", `${(0.5 - vertical) * 10}deg`);
                disk.style.setProperty("--tilt-y", `${(horizontal - 0.5) * 12}deg`);
                disk.style.setProperty("--shine-x", `${horizontal * 100}%`);
                disk.style.setProperty("--shine-y", `${vertical * 100}%`);
            });
        });
        disk.addEventListener("pointerleave", resetTilt);
        disk.addEventListener("pointercancel", resetTilt);
        diskMotion.addEventListener("change", resetTilt);
    });
    const syncProjectDots = () => {
        const current = Math.min(
            projectDots.length - 1,
            Math.round(projectSlides.scrollLeft / Math.max(1, slideStep())),
        );
        projectDots.forEach((dot, index) =>
            dot.setAttribute("aria-pressed", String(index === current)),
        );
        projectCards.forEach((slide, index) => {
            slide.classList.toggle("is-active", index === current);
            slide.classList.toggle("is-previous", index < current);
            slide.classList.toggle("is-next", index > current);
        });
        $("#project-status").textContent = `Project ${current + 1} of ${projectDots.length}`;
    };
    syncProjectDots();
    projectSlides.addEventListener("scroll", syncProjectDots, { passive: true });
    window.addEventListener("resize", () => {
        const current = projectDots.findIndex((dot) => dot.getAttribute("aria-pressed") === "true");
        projectSlides.scrollTo({
            left: Math.max(0, current) * slideStep(),
            behavior: "instant",
        });
    });
}
$$(".magnetic").forEach((button) => {
    button.addEventListener("pointermove", (event) => {
        if (event.pointerType === "touch") return;
        const bounds = button.getBoundingClientRect();
        button.style.transform = `translate(${(event.clientX - bounds.left - bounds.width / 2) * 0.13}px, ${(event.clientY - bounds.top - bounds.height / 2) * 0.2}px)`;
    });
    button.addEventListener("pointerleave", () => (button.style.transform = ""));
});

const darkModeButton = $("#darkModeBtn");

function setDarkMode(isDark) {
    document.body.classList.toggle("dark-mode", isDark);
    document.documentElement.style.colorScheme = isDark ? "dark" : "light";
    if (darkModeButton) {
        darkModeButton.setAttribute("aria-checked", String(isDark));
        darkModeButton.title = isDark ? "Switch to light mode" : "Switch to dark mode";
    }
}

// Storage may be unavailable in private or restricted browsers.
try {
    setDarkMode(localStorage.getItem("portfolio-theme") === "dark");
} catch {}

darkModeButton?.addEventListener("click", () => {
    const isDark = !document.body.classList.contains("dark-mode");
    setDarkMode(isDark);
    try {
        localStorage.setItem("portfolio-theme", isDark ? "dark" : "light");
    } catch {}
});

document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
        const wasOpen = navLinks.classList.contains("show");
        navLinks.classList.remove("show");
        menu.setAttribute("aria-expanded", "false");
        if (wasOpen) menu.focus();
    }
});

const pageMotionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");
const nativePageTransitions =
    location.protocol !== "file:" &&
    "PageSwapEvent" in window &&
    CSS.supports("view-transition-name", "page");
let pageNavigationTimer;
let pageIsLeaving = false;

const resetPageTransition = () => {
    clearTimeout(pageNavigationTimer);
    pageIsLeaving = false;
    document.body.classList.remove("page-transition-leaving");
};

window.addEventListener("pageshow", resetPageTransition);
pageMotionPreference.addEventListener("change", resetPageTransition);

if (!nativePageTransitions && !pageMotionPreference.matches) {
    document.body.classList.add("page-transition-entering");
    document.body.addEventListener("animationend", (event) => {
        if (event.animationName === "page-arrive") {
            document.body.classList.remove("page-transition-entering");
        }
    });
}

document.addEventListener("click", (event) => {
    if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey ||
        pageMotionPreference.matches ||
        nativePageTransitions
    )
        return;
    const link = event.target.closest("a[href]");
    if (!link || link.hasAttribute("download") || (link.target && link.target !== "_self")) return;
    const destination = new URL(link.href, location.href);
    if (
        destination.protocol !== location.protocol ||
        destination.host !== location.host ||
        !/\.html$/i.test(destination.pathname) ||
        (destination.pathname === location.pathname && destination.search === location.search)
    )
        return;
    event.preventDefault();
    if (pageIsLeaving) return;
    pageIsLeaving = true;
    document.body.classList.add("page-transition-leaving");
    pageNavigationTimer = setTimeout(() => location.assign(destination.href), 180);
});

// Preview the CV before offering the file download; links still work without JS.
const cvLinks = document.querySelectorAll('a[download][href$="REBUSA_AmberKaia_CV.pdf"]');
if (cvLinks.length) {
    const cvDialog = document.createElement("dialog");
    cvDialog.className = "cv-preview-dialog";
    cvDialog.setAttribute("aria-labelledby", "cv-preview-title");
    cvDialog.innerHTML = `
        <div class="cv-preview-header">
            <h2 id="cv-preview-title">My curriculum vitae</h2>
            <button type="button" class="cv-preview-close" aria-label="Close CV preview">
                <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round">
                    <path d="m6 6 12 12M18 6 6 18" />
                </svg>
            </button>
        </div>
        <div class="cv-preview-document"></div>
        <div class="cv-preview-actions">
            <a class="project-action" target="_blank" rel="noopener">Open PDF in a new tab</a>
            <a class="project-action primary" download="Amber_Kaia_Rebusa_CV.pdf">Download CV</a>
        </div>`;
    document.body.append(cvDialog);
    let cvTrigger;
    const closeCV = () => softCloseDialog(cvDialog);
    cvDialog.querySelector(".cv-preview-close").addEventListener("click", closeCV);
    cvDialog.addEventListener("cancel", (event) => {
        event.preventDefault();
        closeCV();
    });
    cvDialog.addEventListener("click", (event) => {
        if (event.target !== cvDialog) return;
        const bounds = cvDialog.getBoundingClientRect();
        if (event.clientX < bounds.left || event.clientX > bounds.right ||
            event.clientY < bounds.top || event.clientY > bounds.bottom) closeCV();
    });
    cvDialog.addEventListener("close", () => {
        document.body.classList.remove("cv-preview-open");
        cvTrigger?.focus();
    });
    cvLinks.forEach((link) => {
        link.setAttribute("aria-haspopup", "dialog");
        link.addEventListener("click", (event) => {
            if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
            event.preventDefault();
            cvTrigger = link;
            cvDialog.querySelectorAll("a").forEach((action) => action.href = link.href);
            if (!cvDialog.querySelector("object")) {
                const documentPreview = document.createElement("object");
                documentPreview.type = "application/pdf";
                documentPreview.data = link.href;
                documentPreview.setAttribute("aria-label", "Amber Kaia Rebusa CV preview");
                const fallback = document.createElement("p");
                fallback.textContent = "Use ‘Open PDF in a new tab’ below to preview the CV in your browser.";
                documentPreview.append(fallback);
                cvDialog.querySelector(".cv-preview-document").append(documentPreview);
            }
            cvDialog.showModal();
            document.body.classList.add("cv-preview-open");
        });
    });
}
