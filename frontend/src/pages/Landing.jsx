import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';

export default function Landing() {
    const navigate = useNavigate();
    const [demoOpen, setDemoOpen] = useState(false);
    const [messages, setMessages] = useState([
        {
            role: 'bot', text: "Assalam-o-Alaikum! I am the AI assistant for Hassan Clinic. How can I help you today? 🏥"
        }
    ]);
    const [input, setInput] = useState('');
    const [typing, setTyping] = useState(false);

    const demoReplies = {
        'appointment': '📅 Sure! Could you please tell me your name?',
        'timing': '🕐 We are open Monday-Saturday, 10 AM - 8 PM. Closed on Sundays.',
        'price': '💰 Teeth Cleaning: $100, Filling:  $200, Extraction: $300',
        'hello': '👋 Hello! How can I help you today?',
        'hi': '👋 Hi! How can I assist you?',
        'default': '🤖 I can be fully customized for your business! I handle appointment bookings, FAQs, lead capture — and much more!'
    };

    const getDemoReply = (msg) => {
        const lower = msg.toLowerCase();
        for (const key of Object.keys(demoReplies)) {
            if (lower.includes(key)) return demoReplies[key];
        }
        return demoReplies['default'];
    };

    const sendDemo = async () => {
        if (!input.trim()) return;
        const userMsg = input.trim();
        setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
        setInput('');
        setTyping(true);
        setTimeout(() => {
            setTyping(false);
            setMessages(prev => [...prev, { role: 'bot', text: getDemoReply(userMsg) }]);
        }, 1000);
    };

    const plans = [
        {
            name: 'Trial',
            price: 'Free',
            period: '14 days',
            color: 'border-gray-200',
            btn: 'bg-gray-100 text-gray-700',
            whatsapp: null, // Free — seedha register
            features: ['1 website', 'Basic AI', '100 messages/month', 'Appointment booking'],
        },
        {
            name: 'Starter',
            price: '$99',
            period: 'per month',
            color: 'border-blue-500 shadow-xl shadow-blue-100',
            badge: 'Most Popular',
            btn: 'bg-blue-600 text-white',
            whatsapp: 'Starter', // WhatsApp pe bhejo
            features: ['1 website', 'Advanced AI', '2,000 messages/month', 'Lead capture', 'Priority support'],
        },
        {
            name: 'Business',
            price: '$299',
            period: 'per month',
            color: 'border-purple-500',
            btn: 'bg-purple-600 text-white',
            whatsapp: 'Business',
            features: ['3 websites', 'Premium AI', '10,000 messages/month', 'Custom branding', 'Dedicated support'],
        },
    ];

    // Button click handler
    const handlePlanClick = (plan) => {
  if (plan.name === 'Trial') {
    navigate('/login');
    return;
  }

  const phone = '+92 3359554095'; // apna number
  const msg = encodeURIComponent(
    `Hi! I want to subscribe to Veloxa ${plan.name} Plan (${plan.price}/month). Please activate it for me.`
  );
  window.open(`https://wa.me/${phone}?text=${msg}`, '_blank');
};

    return (
        <div className="min-h-screen bg-white font-sans">

            {/* NAVBAR */}
            <nav className="fixed top-0 w-full bg-white/90 backdrop-blur-md border-b border-gray-100 z-50">
                <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <span className="text-2xl">🤖</span>
                        <span className="text-xl font-bold text-gray-800">Veloxa</span>
                    </div>
                    <div className="hidden md:flex items-center gap-8 text-sm text-gray-500">
                        <a href="#features" className="hover:text-blue-600 transition-colors">Features</a>
                        <a href="#how" className="hover:text-blue-600 transition-colors">How it works</a>
                        <a href="#pricing" className="hover:text-blue-600 transition-colors">Pricing</a>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => navigate('/login')}
                            className="text-sm text-gray-600 hover:text-blue-600 font-medium"
                        >
                            Login
                        </button>
                        <button
                            onClick={() => navigate('/login')}
                            className="text-sm bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 transition-all"
                        >
                            Start Free Trial
                        </button>
                    </div>
                </div>
            </nav>

            {/* HERO */}
            <section className="pt-32 pb-20 px-6 bg-gradient-to-br from-blue-50 via-white to-purple-50">
                <div className="max-w-6xl mx-auto flex flex-col lg:flex-row items-center gap-12">

                    {/* Left */}
                    <div className="flex-1 text-center lg:text-left">
                        <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-600 text-xs font-medium px-3 py-1.5 rounded-full mb-6">
                            <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse"></span>
                            AI-Powered Customer Assistant
                        </div>
                        <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 leading-tight mb-6">
                            Add AI to your
                            <span className="text-blue-600"> website </span>
                            in 60 seconds
                        </h1>
                        <p className="text-lg text-gray-500 mb-8 max-w-xl">
                            Your business gets a 24/7 AI assistant that answers questions,
                            books appointments, and captures leads — automatically.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                            <button
                                onClick={() => navigate('/login')}
                                className="bg-blue-600 text-white px-8 py-4 rounded-2xl font-semibold text-lg hover:bg-blue-700 transition-all shadow-lg shadow-blue-200"
                            >
                                Start Free Trial →
                            </button>
                            <button
                                onClick={() => setDemoOpen(true)}
                                className="border border-gray-200 text-gray-700 px-8 py-4 rounded-2xl font-semibold text-lg hover:border-blue-300 hover:text-blue-600 transition-all"
                            >
                                💬 Try Demo
                            </button>
                        </div>
                        <p className="text-xs text-gray-400 mt-4">
                            14 day free trial · No credit card required
                        </p>
                    </div>

                    {/* Right — Mock website with widget */}
                    <div className="flex-1 w-full max-w-lg">
                        <div className="bg-gray-100 rounded-2xl p-3 shadow-2xl">
                            <div className="flex gap-1.5 mb-3">
                                <div className="w-3 h-3 rounded-full bg-red-400"></div>
                                <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                                <div className="w-3 h-3 rounded-full bg-green-400"></div>
                            </div>
                            <div className="bg-white rounded-xl p-6 min-h-48 relative">
                                <div className="w-3/4 h-3 bg-gray-100 rounded mb-3"></div>
                                <div className="w-1/2 h-3 bg-gray-100 rounded mb-6"></div>
                                <div className="w-full h-24 bg-gray-50 rounded-xl"></div>

                                {/* Mini chat widget preview */}
                                <div className="absolute bottom-4 right-4">
                                    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 w-56 mb-2 overflow-hidden">
                                        <div className="bg-blue-600 px-3 py-2 text-white text-xs font-medium">
                                            🤖 AI Assistant
                                        </div>
                                        <div className="p-3 space-y-2">
                                            <div className="bg-gray-100 rounded-xl rounded-bl-sm p-2 text-xs text-gray-600">
                                                Assalam-o-Alaikum! How can I help you today? 👋
                                            </div>

                                            <div className="bg-blue-600 rounded-xl rounded-br-sm p-2 text-xs text-white text-right">
                                                I would like to book an appointment.
                                            </div>

                                            <div className="bg-gray-100 rounded-xl rounded-bl-sm p-2 text-xs text-gray-600">
                                                Sure! Could you please tell me your name? 📅
                                            </div>
                                        </div>
                                    </div>
                                    <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white ml-auto shadow-lg">
                                        💬
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* STATS */}
            <section className="py-12 border-y border-gray-100">
                <div className="max-w-6xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                    {[
                        { num: '24/7', label: 'Always available' },
                        { num: '60s', label: 'Setup time' },
                        { num: '100%', label: 'Customizable' },
                        { num: '0', label: 'Staff needed' },
                    ].map((s, i) => (
                        <div key={i}>
                            <p className="text-3xl font-bold text-blue-600">{s.num}</p>
                            <p className="text-sm text-gray-400 mt-1">{s.label}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* FEATURES */}
            <section id="features" className="py-20 px-6">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-gray-900 mb-4">
                            Everything your business needs
                        </h2>
                        <p className="text-gray-400">One AI assistant, infinite possibilities</p>
                    </div>
                    <div className="grid md:grid-cols-3 gap-6">
                        {[
                            { icon: '💬', title: '24/7 Customer Support', desc: 'Never miss a customer again. AI answers instantly, day or night, in any language.' },
                            { icon: '📅', title: 'Smart Appointment Booking', desc: 'Bot collects name, date, time and saves booking automatically. Zero manual work.' },
                            { icon: '🎯', title: 'Lead Capture', desc: 'Every visitor\'s info is saved. Wake up to a list of warm leads every morning.' },
                            { icon: '🔌', title: 'One Line Installation', desc: 'Paste one script tag anywhere. Works on any website — WordPress, Wix, or custom.' },
                            { icon: '🎨', title: 'Full Customization', desc: 'Your bot name, your colors, your personality. Completely branded for your business.' },
                            { icon: '📊', title: 'Live Dashboard', desc: 'See all conversations, bookings and stats in real time from your dashboard.' },
                        ].map((f, i) => (
                            <div key={i} className="bg-gray-50 rounded-2xl p-6 hover:shadow-md transition-all">
                                <div className="text-3xl mb-4">{f.icon}</div>
                                <h3 className="font-semibold text-gray-800 mb-2">{f.title}</h3>
                                <p className="text-sm text-gray-400 leading-relaxed">{f.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* HOW IT WORKS */}
            <section id="how" className="py-20 px-6 bg-gray-50">
                <div className="max-w-4xl mx-auto">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-gray-900 mb-4">How it works</h2>
                        <p className="text-gray-400">Up and running in 3 simple steps</p>
                    </div>
                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            { step: '01', title: 'Create Account', desc: 'Sign up free. Tell us about your business — clinic, restaurant, salon, anything.' },
                            { step: '02', title: 'Customize Your Bot', desc: 'Add your business info, set timings, services, and prices. Bot learns everything.' },
                            { step: '03', title: 'Paste & Go Live', desc: 'Copy one line of code. Paste on your website. Your AI assistant is live instantly.' },
                        ].map((s, i) => (
                            <div key={i} className="text-center">
                                <div className="w-14 h-14 bg-blue-600 text-white rounded-2xl flex items-center justify-center text-lg font-bold mx-auto mb-4">
                                    {s.step}
                                </div>
                                <h3 className="font-semibold text-gray-800 mb-2">{s.title}</h3>
                                <p className="text-sm text-gray-400">{s.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* PRICING */}
            <section id="pricing" className="py-20 px-6">
                <div className="max-w-5xl mx-auto">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-gray-900 mb-4">Simple pricing</h2>
                        <p className="text-gray-400">Start free. Upgrade when you're ready.</p>
                    </div>
                    <div className="grid md:grid-cols-3 gap-6">
                        {[
                            {
                                name: 'Trial',
                                price: 'Free',
                                period: '14 days',
                                color: 'border-gray-200',
                                btn: 'bg-gray-100 text-gray-700',
                                features: ['1 website', 'Basic AI responses', 'Appointment booking', 'Up to 100 messages/month'],
                            },
                            {
                                name: 'Starter',
                                price: '$99',
                                period: 'per month',
                                color: 'border-blue-500 shadow-xl shadow-blue-100',
                                badge: 'Most Popular',
                                btn: 'bg-blue-600 text-white',
                                features: ['1 website', 'Advanced AI', 'Unlimited messages', 'Lead capture', 'Email support'],
                            },
                            {
                                name: 'Business',
                                price: '$299',
                                period: 'per month',
                                color: 'border-purple-500',
                                btn: 'bg-purple-600 text-white',
                                features: ['3 websites', 'Premium AI model', 'Priority support', 'Custom branding', 'Analytics dashboard'],
                            },
                        ].map((plan, i) => (
                            <div key={i} className={`border-2 ${plan.color} rounded-2xl p-6 relative`}>
                                {plan.badge && (
                                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-xs px-3 py-1 rounded-full">
                                        {plan.badge}
                                    </div>
                                )}
                                <h3 className="font-bold text-gray-800 text-lg mb-1">{plan.name}</h3>
                                <div className="mb-4">
                                    <span className="text-3xl font-bold text-gray-900">{plan.price}</span>
                                    <span className="text-gray-400 text-sm ml-1">/ {plan.period}</span>
                                </div>
                                <ul className="space-y-2 mb-6">
                                    {plan.features.map((f, j) => (
                                        <li key={j} className="text-sm text-gray-500 flex items-center gap-2">
                                            <span className="text-green-500">✓</span> {f}
                                        </li>
                                    ))}
                                </ul>
                                <button
                                    onClick={() => handlePlanClick(plan)}
                                    className={`w-full py-3 rounded-xl font-medium cursor-pointer text-sm ${plan.btn}`}
                                >
                                   {
                                    plan.name !== "Trial"
                                    ? "💬 Subscribe via WhatsApp"
                                   : "Start Free Trial"
                                   }
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-20 px-6 bg-gradient-to-r from-blue-600 to-purple-600">
                <div className="max-w-3xl mx-auto text-center">
                    <h2 className="text-3xl font-bold text-white mb-4">
                        Ready to grow your business?
                    </h2>
                    <p className="text-blue-100 mb-8">
                        Join businesses already using Veloxa to serve customers 24/7
                    </p>
                    <button
                        onClick={() => navigate('/login')}
                        className="bg-white text-blue-600 px-8 py-4 rounded-2xl font-semibold text-lg hover:shadow-xl transition-all"
                    >
                        Start Free Trial — It's Free! 🚀
                    </button>
                </div>
            </section>

            {/* FOOTER */}
            <footer className="py-8 px-6 border-t border-gray-100">
                <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                        <span className="text-xl">🤖</span>
                        <span className="font-bold text-gray-700">Veloxa</span>
                    </div>
                    <p className="text-sm text-gray-400">
                        © 2026 Veloxa. AI Assistant Platform for Pakistani Businesses.
                    </p>
                    <div className="flex gap-6 text-sm text-gray-400">
                        <a href="#" className="hover:text-blue-600">Privacy</a>
                        <a href="#" className="hover:text-blue-600">Terms</a>
                        <a href="#" className="hover:text-blue-600">Contact</a>
                    </div>
                </div>
            </footer>

            {/* DEMO MODAL */}
            {demoOpen && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl">
                        <div className="bg-blue-600 px-4 py-3 flex items-center justify-between">
                            <span className="text-white font-medium">🤖 Try Veloxa Demo</span>
                            <button onClick={() => setDemoOpen(false)} className="text-white/80 hover:text-white">✕</button>
                        </div>
                        <div className="h-72 overflow-y-auto p-4 space-y-3">
                            {messages.map((m, i) => (
                                <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-xs px-3 py-2 rounded-2xl text-sm ${m.role === 'user'
                                        ? 'bg-blue-600 text-white rounded-br-sm'
                                        : 'bg-gray-100 text-gray-700 rounded-bl-sm'
                                        }`}>
                                        {m.text}
                                    </div>
                                </div>
                            ))}
                            {typing && (
                                <div className="flex justify-start">
                                    <div className="bg-gray-100 text-gray-400 px-3 py-2 rounded-2xl text-sm">...</div>
                                </div>
                            )}
                        </div>
                        <div className="p-3 border-t border-gray-100 flex gap-2">
                            <input
                                value={input}
                                onChange={e => setInput(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && sendDemo()}
                                placeholder="Try: appointment, timing, price..."
                                className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-blue-400"
                            />
                            <button
                                onClick={sendDemo}
                                className="bg-blue-600 text-white px-4 py-2 rounded-xl text-sm hover:bg-blue-700"
                            >
                                ➤
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}