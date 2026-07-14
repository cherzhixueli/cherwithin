// ============================================
// 心理咨询师网站 — 交互脚本
// 签名视觉：神经元连接动画（呼应"心智连接"主题）
// ============================================

document.addEventListener('DOMContentLoaded', () => {
  initNeuralCanvas();
  initReveal();
  initMobileNav();
  initChatWidget();
});

/* ---------- 神经元连接背景动画 ---------- */
function initNeuralCanvas() {
  const canvas = document.getElementById('neural-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  let width, height, nodes = [];
  const mouse = { x: null, y: null };

  function resize() {
    width = canvas.width = canvas.offsetWidth;
    height = canvas.height = canvas.offsetHeight;
    const count = Math.min(70, Math.floor((width * height) / 18000));
    nodes = Array.from({ length: count }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.25,
      vy: (Math.random() - 0.5) * 0.25,
      r: Math.random() * 1.6 + 1
    }));
  }

  window.addEventListener('resize', resize);
  canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    mouse.x = e.clientX - rect.left;
    mouse.y = e.clientY - rect.top;
  });
  canvas.addEventListener('mouseleave', () => { mouse.x = null; mouse.y = null; });

  resize();

  function draw() {
    ctx.clearRect(0, 0, width, height);

    for (const n of nodes) {
      n.x += n.vx;
      n.y += n.vy;
      if (n.x < 0 || n.x > width) n.vx *= -1;
      if (n.y < 0 || n.y > height) n.vy *= -1;
    }

    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const a = nodes[i], b = nodes[j];
        const dx = a.x - b.x, dy = a.y - b.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 130) {
          const opacity = (1 - dist / 130) * 0.35;
          ctx.strokeStyle = `rgba(180, 130, 90, ${opacity})`;
          ctx.lineWidth = 0.6;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }
      // connect to mouse
      if (mouse.x !== null) {
        const dx = a.x - mouse.x, dy = a.y - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 160) {
          const opacity = (1 - dist / 160) * 0.5;
          ctx.strokeStyle = `rgba(196, 110, 100, ${opacity})`;
          ctx.lineWidth = 0.8;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(mouse.x, mouse.y);
          ctx.stroke();
        }
      }
    }

    for (const n of nodes) {
      ctx.beginPath();
      ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(150, 105, 65, 0.55)';
      ctx.fill();
    }

    if (!prefersReduced) requestAnimationFrame(draw);
  }

  draw();
}

/* ---------- 滚动淡入 ---------- */
function initReveal() {
  const items = document.querySelectorAll('.reveal');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });
  items.forEach((el) => observer.observe(el));
}

/* ---------- 移动端导航 ---------- */
function initMobileNav() {
  const toggle = document.querySelector('.nav-toggle');
  const drawer = document.querySelector('.mobile-drawer');
  const close = document.querySelector('.mobile-close');
  if (!toggle || !drawer) return;
  toggle.addEventListener('click', () => drawer.classList.add('open'));
  close?.addEventListener('click', () => drawer.classList.remove('open'));
  drawer.querySelectorAll('a').forEach((a) =>
    a.addEventListener('click', () => drawer.classList.remove('open'))
  );
}

/* ---------- 规则问答聊天助手 ----------
   这是免费方案：纯前端、按关键词匹配预设回答，
   不接入任何真实 AI 模型，也不会产生任何调用费用。
   如果未来想升级成真正的 AI 助手（能自由对话、
   慢慢学习你的语气），需要额外的后端服务和按量计费的
   AI API，届时这个函数可以整体替换掉。

   使用说明：
   - CHAT_RESPONSES 里的 keywords 是触发词，命中任意一个
     关键词就会返回对应的 answer。
   - 想改回答内容，只改 answer 字段里的文字即可。
   - 想加新问题，复制一组 { keywords, answer } 即可。
------------------------------------------- */
function initChatWidget() {
  const widget = document.querySelector('.chat-widget');
  if (!widget) return;

  const toggle = widget.querySelector('.chat-toggle');
  const panel = widget.querySelector('.chat-panel');
  const closeBtn = widget.querySelector('.chat-close');
  const messages = widget.querySelector('.chat-messages');
  const quickReplies = widget.querySelectorAll('.chat-quick-reply');
  const lang = document.documentElement.lang === 'en' ? 'en' : 'zh';

  const CHAT_RESPONSES = {
    zh: {
      fallback: '这个问题我暂时还回答不了，直接发邮件到 [邮箱地址占位] 或通过 Instagram 私信 Cher，会更快得到准确答复。',
      items: [
        { keywords: ['预约', '约时间', 'booking', '怎么约'], answer: '可以直接通过 Calendly 预约时间：<a href="https://calendly.com/cherzhixueli" target="_blank" style="color:var(--accent-cyan);">点击这里预约</a>。' },
        { keywords: ['价格', '费用', '多少钱', '收费'], answer: '目前心理治疗和成长教练的价格都是 $150 一次。如果你有需要，欢迎询问 sliding scale（滑动制收费）——我会根据季度和当下的接待情况提供滑动制计费。' },
        { keywords: ['形式', '线上', '线下', '视频', '地点'], answer: '目前 Cher 只提供线上咨询，通过视频通话进行，不受地域限制（心理治疗部分仍需在持证执业州/地区内）。' },
        { keywords: ['风格', '取向', '流派', '怎么样的咨询师'], answer: 'Cher 的工作方式建立在正念取向的超个人心理咨询之上，同时融合身体经验、格式塔、依恋理论、内在家庭系统（IFS）等视角，具体可以看网站的 Approach 板块。' },
        { keywords: ['服务对象', '青少年', '成人', '年龄'], answer: 'Cher 目前面向青少年和成人来访者。' }
      ]
    },
    en: {
      fallback: "I can't answer that one yet — email [email placeholder] or message Cher on Instagram for a direct answer.",
      items: [
        { keywords: ['book', 'schedule', 'appointment', 'call'], answer: 'You can book directly via Calendly: <a href="https://calendly.com/cherzhixueli" target="_blank" style="color:var(--accent-cyan);">book a call here</a>.' },
        { keywords: ['price', 'cost', 'fee', 'rate'], answer: 'Current rates are $150 for both therapy and coaching sessions. Please ask about sliding scale if you need it — I offer sliding-scale rates seasonally, based on availability.' },
        { keywords: ['online', 'in person', 'format', 'location'], answer: 'Cher currently offers online sessions only, over video — available worldwide for coaching (therapy is limited to the licensed jurisdiction).' },
        { keywords: ['approach', 'style', 'modality', 'orientation'], answer: "Cher's work is grounded in mindfulness-based transpersonal psychotherapy, along with somatic, Gestalt, attachment, and parts-work perspectives — see the Approach section for more." },
        { keywords: ['who', 'teen', 'adult', 'age'], answer: 'Cher currently works with teens and adults.' }
      ]
    }
  };

  function addMessage(text, sender) {
    const el = document.createElement('div');
    el.className = `chat-message ${sender}`;
    el.innerHTML = text;
    messages.appendChild(el);
    messages.scrollTop = messages.scrollHeight;
  }

  function respond(question) {
    addMessage(question, 'user');
    const data = CHAT_RESPONSES[lang];
    const match = data.items.find((item) =>
      item.keywords.some((k) => question.toLowerCase().includes(k.toLowerCase()))
    );
    setTimeout(() => addMessage(match ? match.answer : data.fallback, 'bot'), 300);
  }

  toggle?.addEventListener('click', () => panel.classList.toggle('open'));
  closeBtn?.addEventListener('click', () => panel.classList.remove('open'));
  quickReplies.forEach((btn) =>
    btn.addEventListener('click', () => respond(btn.textContent))
  );
}
