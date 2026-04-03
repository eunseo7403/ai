/* ── Modal ─────────────────────────────────── */
const modal = document.getElementById("formModal");
const closeBtn = document.getElementById("modalClose");
const leadForm = document.getElementById("leadForm");
const formMessage = document.getElementById("formMessage");
const submitBtn = document.querySelector(".form-submit-btn");
const userPhone = document.getElementById("userPhone");

function openModal() {
  document.body.style.overflow = "hidden";
  modal.classList.add("open");
}

function closeModal() {
  modal.classList.remove("open");
  document.body.style.overflow = "";
}

document.querySelectorAll(".open-modal").forEach((el) => {
  el.addEventListener("click", (e) => {
    e.preventDefault();
    openModal();
  });
});

closeBtn.addEventListener("click", closeModal);

modal.addEventListener("click", (e) => {
  if (e.target === modal) closeModal();
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeModal();
});

/* ── Phone format ──────────────────────────── */
userPhone.addEventListener("input", (e) => {
  let value = e.target.value.replace(/[^0-9]/g, "");

  if (value.length < 4) {
    e.target.value = value;
  } else if (value.length < 8) {
    e.target.value = `${value.slice(0, 3)}-${value.slice(3)}`;
  } else {
    e.target.value = `${value.slice(0, 3)}-${value.slice(3, 7)}-${value.slice(7, 11)}`;
  }
});

/* ── Form submit ───────────────────────────── */
leadForm.addEventListener("submit", (event) => {
  const name = document.getElementById("userName").value.trim();
  const phone = document.getElementById("userPhone").value.trim();
  const email = document.getElementById("userEmail").value.trim();

  if (!name || !phone || !email) {
    event.preventDefault();
    formMessage.textContent = "이름, 전화번호, 이메일을 모두 입력해주세요.";
    formMessage.className = "form-message error";
    return;
  }

  submitBtn.disabled = true;
  submitBtn.textContent = "접수 중...";
  formMessage.textContent = "신청이 접수되었습니다.";
  formMessage.className = "form-message success";

  setTimeout(() => {
    leadForm.reset();
    submitBtn.disabled = false;
    submitBtn.textContent = "지금 신청하기";
  }, 800);

  setTimeout(() => {
    closeModal();
  }, 1200);
});

/* ── Navbar scroll ─────────────────────────── */
const navbar = document.getElementById("navbar");
window.addEventListener("scroll", () => {
  navbar.classList.toggle("scrolled", window.scrollY > 20);
});

/* ── Scroll reveal ─────────────────────────── */
const revealEls = document.querySelectorAll(".reveal");
const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        e.target.classList.add("visible");
        observer.unobserve(e.target);
      }
    });
  },
  { threshold: 0.12, rootMargin: "0px 0px -40px 0px" },
);

revealEls.forEach((el) => observer.observe(el));

/* ── Number counter ────────────────────────── */
function animateCount(el) {
  const target = parseInt(el.dataset.target, 10);
  const duration = 1400;
  const start = performance.now();

  function tick(now) {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    const ease = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.floor(ease * target);

    if (progress < 1) {
      requestAnimationFrame(tick);
    } else {
      el.textContent = target;
    }
  }

  requestAnimationFrame(tick);
}

const countEls = document.querySelectorAll(".counting");
const countObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        animateCount(e.target);
        countObserver.unobserve(e.target);
      }
    });
  },
  { threshold: 0.5 },
);

countEls.forEach((el) => countObserver.observe(el));

/* ── Tabs ──────────────────────────────────── */
const tabBtns = document.querySelectorAll(".tab-btn");
const tabPanels = document.querySelectorAll(".tab-panel");

tabBtns.forEach((btn) => {
  btn.addEventListener("click", () => {
    const target = btn.dataset.tab;

    tabBtns.forEach((b) => b.classList.remove("active"));
    tabPanels.forEach((p) => p.classList.remove("active"));

    btn.classList.add("active");
    document.getElementById("tab-" + target).classList.add("active");
  });
});

/* ── Smooth scroll for anchors ─────────────── */
document.querySelectorAll('a[href^="#"]').forEach((a) => {
  a.addEventListener("click", (e) => {
    const id = a.getAttribute("href");
    if (id === "#") return;

    const target = document.querySelector(id);
    if (target) {
      e.preventDefault();
      const top = target.getBoundingClientRect().top + window.scrollY - 72;
      window.scrollTo({ top, behavior: "smooth" });
    }
  });
});

/* ── Hero reveal on load ───────────────────── */
document.querySelectorAll("#hero .reveal").forEach((el, i) => {
  setTimeout(() => el.classList.add("visible"), i * 120 + 100);
});
