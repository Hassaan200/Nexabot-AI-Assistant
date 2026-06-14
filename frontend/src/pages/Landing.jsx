import { useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';

// Smooth fade-in hook
const useInView = () => {
    const ref = useRef(null);
    const [inView, setInView] = useState(false);
    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => { if (entry.isIntersecting) setInView(true); },
            { threshold: 0.1 }
        );
        if (ref.current) observer.observe(ref.current);
        return () => observer.disconnect();
    }, []);
    return [ref, inView];
};

const FadeIn = ({ children, delay = 0, className = '' }) => {
    const [ref, inView] = useInView();
    return (
        <div
            ref={ref}
            className={className}
            style={{
                opacity: inView ? 1 : 0,
                transform: inView ? 'translateY(0)' : 'translateY(24px)',
                transition: `opacity 0.6s ease ${delay}s, transform 0.6s ease ${delay}s`,
            }}
        >
            {children}
        </div>
    );
};

export default function Landing() {
    const navigate = useNavigate();
    const [demoOpen, setDemoOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [mobileMenu, setMobileMenu] = useState(false);
    const [messages, setMessages] = useState([
        { role: 'bot', text: "Hi! I'm the AI assistant for Veloxa Demo Clinic. How can I help you today? 👋" }
    ]);
    const [input, setInput] = useState('');
    const [typing, setTyping] = useState(false);
    const { client } = useAuth();
    const messagesEndRef = useRef(null);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Handle hash-based scrolling for anchor links
    useEffect(() => {
        const handleHashScroll = () => {
            const hash = window.location.hash;
            if (hash) {
                const element = document.getElementById(hash.slice(1));
                if (element) {
                    setTimeout(() => {
                        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }, 100);
                }
            }
        };

        // Handle on page load
        handleHashScroll();

        // Handle on hash change
        window.addEventListener('hashchange', handleHashScroll);
        return () => window.removeEventListener('hashchange', handleHashScroll);
    }, []);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, typing]);

    const demoReplies = {
        'appointment': '📅 Sure! I can book that for you. Could you please share your name?',
        'book': '📅 Great! Let me help you book. What is your name?',
        'timing': '🕐 We are open Monday–Saturday, 9 AM – 7 PM. Closed on Sundays.',
        'hours': '🕐 Our working hours are Monday–Saturday, 9 AM – 7 PM.',
        'price': '💰 Consultation: $50 | Follow-up: $30 | Full checkup: $120',
        'cost': '💰 Consultation: $50 | Follow-up: $30 | Full checkup: $120',
        'hello': '👋 Hello! How can I assist you today?',
        'hi': '👋 Hi there! What can I help you with?',
        'location': '📍 We are located at 123 Main Street, Downtown. Easy parking available!',
        'cancel': '❌ No problem! I can help cancel your appointment. Please share your booking name.',
        'default': '🤖 Great question! I can help with appointments, pricing, timings, and more. I am fully customizable for any business!'
    };

    const getDemoReply = (msg) => {
        const lower = msg.toLowerCase();
        for (const key of Object.keys(demoReplies)) {
            if (lower.includes(key)) return demoReplies[key];
        }
        return demoReplies['default'];
    };

    const sendDemo = () => {
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

    const checkoutUrls = {
        Starter: 'https://veloxa-ai.lemonsqueezy.com/checkout/buy/e42bdc9e-47bb-466f-af69-4c1ff2958073',
        Business: 'https://veloxa-ai.lemonsqueezy.com/checkout/buy/c11d823a-a905-4962-8ca2-1f070c326cff',
    }

    const handlePlanClick = (plan) => {
        if (plan.name === 'Trial') {
            navigate('/login');
            return;
        }

        const baseUrl = checkoutUrls[plan.name];
        // Email already logged in hai toh pass karo
        const email = client?.email || '';
        const url = email
            ? `${baseUrl}?checkout[email]=${email}`
            : baseUrl;

        window.open(url, '_blank');

        // const phone = '923359554095';
        // const msg = encodeURIComponent(
        //     `Hi! I want to subscribe to Veloxa ${plan.name} Plan (${plan.price}/month). Please activate it for me.`
        // );
        // window.open(`https://wa.me/${phone}?text=${msg}`, '_blank');
    };

    const plans = [
        {
            name: 'Trial',
            price: 'Free',
            period: '7 days',
            color: 'border-gray-200',
            btn: 'bg-gray-100 text-gray-700 hover:bg-gray-200',
            whatsapp: null,
            features: [
                '1 website',
                'Basic AI responses',
                'Appointment booking',
                '100 messages included',
                '7 day free trial',
            ],
        },
        {
            name: 'Starter',
            price: '$29',
            period: 'per month',
            color: 'border-blue-500 shadow-2xl shadow-blue-100',
            badge: 'Most Popular',
            btn: 'bg-blue-600 text-white hover:bg-blue-700',
            whatsapp: 'Starter',
            features: [
                '1 website',
                'Advanced AI model',
                '10,000 messages/month',
                'Lead capture',
                'Priority support',
            ],
        },
        {
            name: 'Business',
            price: '$79',
            period: 'per month',
            color: 'border-purple-400',
            btn: 'bg-purple-600 text-white hover:bg-purple-700',
            whatsapp: 'Business',
            features: [
                '3 websites',
                'Premium AI model',
                'Unlimited messages',
                'Custom branding',
                'Dedicated support',
            ],
        },
    ];

    const features = [
        { icon: '💬', title: '24/7 Customer Support', desc: 'Automate customer inquiries instantly — day or night, in any language, without hiring extra staff.' },
        { icon: '📅', title: 'Automated Appointment Booking', desc: 'AI collects name, date, time and phone — then saves the booking automatically. Zero manual effort.' },
        { icon: '🎯', title: 'Smart Lead Capture', desc: 'Every visitor interaction is saved. Wake up to qualified leads ready for follow-up.' },
        { icon: '🔌', title: 'One-Line Installation', desc: 'Paste one script tag on any website — WordPress, Wix, Shopify, or custom. Live in 60 seconds.' },
        { icon: '🎨', title: 'Fully Branded', desc: 'Your bot name, your colors, your tone. Completely white-labeled for your business identity.' },
        { icon: '📊', title: 'Real-Time Dashboard', desc: 'Monitor conversations, bookings, and performance metrics from one clean dashboard.' },
    ];

    const industries = [
        { icon: '🏥', name: 'Healthcare & Clinics' },
        { icon: '🍽️', name: 'Restaurants & Cafes' },
        { icon: '💇', name: 'Salons & Spas' },
        { icon: '🏠', name: 'Real Estate' },
        { icon: '📚', name: 'Education & Tutoring' },
        { icon: '🚗', name: 'Auto Services' },
        { icon: '💼', name: 'Professional Services' },
        { icon: '🛍️', name: 'Retail & E-commerce' },
    ];

    return (
        <div className="min-h-screen bg-white font-sans overflow-x-hidden">

            {/* NAVBAR */}
            <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${scrolled
                ? 'bg-white shadow-md'
                : 'bg-white/80 backdrop-blur-md border-b border-gray-100'
                }`}>
                <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-2 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                            <span className="text-white text-sm font-bold">V</span>
                        </div>
                        <span className="text-xl font-bold text-gray-900">Veloxa</span>
                    </div>

                    {/* Desktop nav */}
                    <div className="hidden md:flex items-center gap-8 text-sm text-gray-500">
                        <a href="#features" className="hover:text-blue-600 transition-colors">Features</a>
                        <a href="#industries" className="hover:text-blue-600 transition-colors">Industries</a>
                        <a href="#how" className="hover:text-blue-600 transition-colors">How it works</a>
                        <a href="#pricing" className="hover:text-blue-600 transition-colors">Pricing</a>
                    </div>

                    <div className="hidden md:flex items-center gap-3">
                        <button
                            onClick={() => navigate('/login')}
                            className="text-sm text-gray-600 hover:text-blue-600 font-medium transition-colors cursor-pointer"
                        >
                            Sign In
                        </button>
                        <button
                            onClick={() => navigate('/login')}
                            className="text-sm bg-blue-600 text-white px-5 py-2.5 rounded-xl hover:bg-blue-700 transition-all shadow-sm cursor-pointer"
                        >
                            Start Free Trial
                        </button>
                    </div>

                    {/* Mobile menu button */}
                    <button
                        onClick={() => setMobileMenu(!mobileMenu)}
                        className="md:hidden p-2 text-gray-600"
                    >
                        {mobileMenu ? '✕' : '☰'}
                    </button>
                </div>

                {/* Mobile menu */}
                {/* Mobile menu */}
                <div className={`md:hidden bg-white border-t border-gray-100 overflow-hidden transition-all duration-300 ease-in-out ${mobileMenu ? 'max-h-96 opacity-100 px-6 py-4' : 'max-h-0 opacity-0 px-6 py-0'
                    }`}>
                    {['#features', '#industries', '#how', '#pricing'].map((href, i) => (
                        <a
                            key={i}
                            href={href}
                            onClick={() => setMobileMenu(false)}
                            className="block text-sm text-gray-600 py-2"
                        >
                            {href.replace('#', '').charAt(0).toUpperCase() + href.slice(2)}
                        </a>
                    ))}
                    <button
                        onClick={() => navigate('/login')}
                        className="w-full bg-blue-600 text-white py-3 rounded-xl text-sm font-medium mt-1 mb-2"
                    >
                        Start Free Trial
                    </button>
                </div>
            </nav>

            {/* HERO */}
            <section className="pt-28 pb-20 px-6 bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 relative overflow-hidden">
                {/* Background decoration */}
                <div className="absolute top-20 right-0 w-96 h-96 bg-blue-100 rounded-full blur-3xl opacity-30 pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-72 h-72 bg-purple-100 rounded-full blur-3xl opacity-30 pointer-events-none" />

                <div className="max-w-6xl mx-auto flex flex-col lg:flex-row items-center gap-16 relative">
                    {/* Left */}
                    <div className="flex-1 text-center lg:text-left">
                        <div
                            className="inline-flex items-center gap-2 bg-blue-50 border border-blue-100 text-blue-600 text-xs font-medium px-4 py-2 rounded-full mb-6"
                            style={{ animation: 'fadeIn 0.6s ease' }}
                        >
                            <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                            AI-Powered Business Automation
                        </div>

                        <h1
                            className="text-4xl lg:text-6xl font-bold text-gray-900 leading-tight mb-6"
                            style={{ animation: 'fadeIn 0.8s ease' }}
                        >
                            Automate Customer Support,{' '}
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                                Bookings & Leads
                            </span>{' '}
                            with AI
                        </h1>

                        <p
                            className="text-lg text-gray-500 mb-8 max-w-xl mx-auto lg:mx-0 leading-relaxed"
                            style={{ animation: 'fadeIn 1s ease' }}
                        >
                            Veloxa AI handles customer inquiries, appointment bookings, and lead management
                            automatically — through your website. Setup in 60 seconds.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                            <button
                                onClick={() => navigate('/login')}
                                className="bg-blue-600 text-white px-8 py-4 rounded-2xl font-semibold text-base hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 hover:shadow-blue-300 hover:-translate-y-0.5 cursor-pointer"
                                style={{ transition: 'all 0.2s ease' }}
                            >
                                Start Free Trial →
                            </button>
                            <button
                                onClick={() => setDemoOpen(true)}
                                className="border-2 border-gray-200 text-gray-700 px-8 py-4 rounded-2xl font-semibold text-base hover:border-blue-300 hover:text-blue-600 transition-all hover:-translate-y-0.5 cursor-pointer"
                                style={{ transition: 'all 0.2s ease' }}
                            >
                                💬 Try Live Demo
                            </button>
                        </div>
                        <p className="text-xs text-gray-400 mt-4">
                            7-days free trial · No credit card required · Cancel anytime
                        </p>
                    </div>

                    {/* Right — Browser mockup */}
                    <div className="flex-1 w-full max-w-lg">
                        <div
                            className="bg-gray-200 rounded-2xl p-3 shadow-2xl"
                            style={{ animation: 'fadeIn 1s ease' }}
                        >
                            <div className="flex gap-1.5 mb-3 items-center">
                                <div className="w-3 h-3 rounded-full bg-red-400" />
                                <div className="w-3 h-3 rounded-full bg-yellow-400" />
                                <div className="w-3 h-3 rounded-full bg-green-400" />
                                <div className="flex-1 mx-3 bg-white rounded-md h-5 flex items-center px-2">
                                    <span className="text-gray-400 text-xs">mybusiness.com</span>
                                </div>
                            </div>
                            <div className="bg-white rounded-xl p-5 min-h-52 relative">
                                <div className="w-2/3 h-3 bg-gray-100 rounded mb-2" />
                                <div className="w-1/2 h-3 bg-gray-100 rounded mb-4" />
                                <div className="w-full h-16 bg-gray-50 rounded-xl mb-3" />
                                <div className="w-3/4 h-3 bg-gray-100 rounded mb-2" />
                                <div className="w-1/2 h-3 bg-gray-100 rounded" />

                                {/* Chat widget preview */}
                                <div className="absolute bottom-3 right-3">
                                    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 w-52 mb-2 overflow-hidden">
                                        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-3 py-2 text-white text-xs font-medium flex items-center gap-2">
                                            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                                            Veloxa AI Assistant
                                        </div>
                                        <div className="p-3 space-y-2">
                                            <div className="bg-gray-100 rounded-xl rounded-bl-sm p-2 text-xs text-gray-600">
                                                Hi! How can I help you today? 👋
                                            </div>
                                            <div className="bg-blue-600 rounded-xl rounded-br-sm p-2 text-xs text-white text-right">
                                                Book an appointment
                                            </div>
                                            <div className="bg-gray-100 rounded-xl rounded-bl-sm p-2 text-xs text-gray-600">
                                                Sure! What's your name? 📅
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
            <section className="py-14 border-y border-gray-100 bg-white">
                <div className="max-w-5xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                    {[
                        { num: '24/7', label: 'Always Online' },
                        { num: '60s', label: 'Setup Time' },
                        { num: '3x', label: 'More Leads Captured' },
                        { num: '0', label: 'Extra Staff Needed' },
                    ].map((s, i) => (
                        <FadeIn key={i} delay={i * 0.1}>
                            <p className="text-3xl lg:text-4xl font-bold text-blue-600">{s.num}</p>
                            <p className="text-sm text-gray-400 mt-1">{s.label}</p>
                        </FadeIn>
                    ))}
                </div>
            </section>

            {/* FEATURES */}
            <section id="features" className="py-24 px-6 bg-white">
                <div className="max-w-6xl mx-auto">
                    <FadeIn>
                        <div className="text-center mb-16">
                            <span className="text-blue-600 text-sm font-semibold uppercase tracking-wider">Features</span>
                            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mt-2 mb-4">
                                Everything you need to automate customer interactions
                            </h2>
                            <p className="text-gray-400 max-w-xl mx-auto">
                                One AI assistant that handles support, bookings, and lead capture — so you can focus on running your business.
                            </p>
                        </div>
                    </FadeIn>

                    <div className="grid md:grid-cols-3 gap-6">
                        {features.map((f, i) => (
                            <FadeIn key={i} delay={i * 0.1}>
                                <div className="bg-gray-50 rounded-2xl p-6 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 border border-transparent hover:border-blue-100">
                                    <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-2xl mb-4">
                                        {f.icon}
                                    </div>
                                    <h3 className="font-semibold text-gray-800 mb-2">{f.title}</h3>
                                    <p className="text-sm text-gray-400 leading-relaxed">{f.desc}</p>
                                </div>
                            </FadeIn>
                        ))}
                    </div>
                </div>
            </section>

            {/* INDUSTRIES */}
            <section id="industries" className="py-24 px-6 bg-gradient-to-br from-gray-50 to-blue-50">
                <div className="max-w-6xl mx-auto">
                    <FadeIn>
                        <div className="text-center mb-12">
                            <span className="text-blue-600 text-sm font-semibold uppercase tracking-wider">Industries</span>
                            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mt-2 mb-4">
                                Built for every type of business
                            </h2>
                            <p className="text-gray-400">
                                Veloxa adapts to your industry — clinic, restaurant, salon, or anything else.
                            </p>
                        </div>
                    </FadeIn>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {industries.map((ind, i) => (
                            <FadeIn key={i} delay={i * 0.05}>
                                <div className="bg-white rounded-2xl p-5 text-center hover:shadow-md hover:-translate-y-1 transition-all duration-300 border border-gray-100">
                                    <div className="text-3xl mb-2">{ind.icon}</div>
                                    <p className="text-sm font-medium text-gray-700">{ind.name}</p>
                                </div>
                            </FadeIn>
                        ))}
                    </div>
                </div>
            </section>

            {/* HOW IT WORKS */}
            <section id="how" className="py-24 px-6 bg-white">
                <div className="max-w-5xl mx-auto">
                    <FadeIn>
                        <div className="text-center mb-16">
                            <span className="text-blue-600 text-sm font-semibold uppercase tracking-wider">How It Works</span>
                            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mt-2 mb-4">
                                Live in 3 simple steps
                            </h2>
                            <p className="text-gray-400">No technical knowledge required.</p>
                        </div>
                    </FadeIn>

                    <div className="grid md:grid-cols-3 gap-8 relative">
                        {/* Connector line desktop */}
                        <div className="hidden md:block absolute top-8 left-1/4 right-1/4 h-0.5 bg-gradient-to-r from-blue-200 to-purple-200" />

                        {[
                            { step: '01', icon: '🏢', title: 'Create Your Account', desc: 'Sign up free. Tell us your business name, type, and services. Takes 2 minutes.' },
                            { step: '02', icon: '🤖', title: 'Train Your AI Bot', desc: 'Add your timings, services, prices, and FAQs. Your bot learns everything about your business.' },
                            { step: '03', icon: '🚀', title: 'Go Live Instantly', desc: 'Copy one line of code. Paste on your website. Your AI assistant is live and ready.' },
                        ].map((s, i) => (
                            <FadeIn key={i} delay={i * 0.2}>
                                <div className="text-center relative">
                                    <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 text-white rounded-2xl flex items-center justify-center text-2xl mx-auto mb-4 shadow-lg shadow-blue-200">
                                        {s.icon}
                                    </div>
                                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold">
                                        {s.step}
                                    </div>
                                    <h3 className="font-bold text-gray-800 mb-2 text-lg">{s.title}</h3>
                                    <p className="text-sm text-gray-400 leading-relaxed">{s.desc}</p>
                                </div>
                            </FadeIn>
                        ))}
                    </div>
                </div>
            </section>

            {/* TRUST / SECURITY */}
            <section className="py-16 px-6 bg-gray-50 border-y border-gray-100">
                <div className="max-w-5xl mx-auto">
                    <FadeIn>
                        <div className="text-center mb-10">
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">
                                Built with security & reliability in mind
                            </h2>
                            <p className="text-gray-400 text-sm">Your business data is always safe and private.</p>
                        </div>
                    </FadeIn>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        {[
                            { icon: '🔒', title: 'Data Isolated', desc: 'Each business has completely separate data' },
                            { icon: '🛡️', title: 'JWT Auth', desc: 'Secure authentication on every request' },
                            { icon: '☁️', title: 'Cloud Hosted', desc: 'Always online with 99.9% uptime' },
                            { icon: '🔑', title: 'API Key System', desc: 'Unique key per business, revokable anytime' },
                        ].map((t, i) => (
                            <FadeIn key={i} delay={i * 0.1}>
                                <div className="text-center">
                                    <div className="text-3xl mb-2">{t.icon}</div>
                                    <p className="text-sm font-semibold text-gray-700">{t.title}</p>
                                    <p className="text-xs text-gray-400 mt-1">{t.desc}</p>
                                </div>
                            </FadeIn>
                        ))}
                    </div>
                </div>
            </section>

            {/* PRICING */}
            <section id="pricing" className="py-24 px-6 bg-white">
                <div className="max-w-5xl mx-auto">
                    <FadeIn>
                        <div className="text-center mb-14">
                            <span className="text-blue-600 text-sm font-semibold uppercase tracking-wider">Pricing</span>
                            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mt-2 mb-4">
                                Simple, transparent pricing
                            </h2>
                            <p className="text-gray-400">Start free. No credit card required. Upgrade when you're ready.</p>
                        </div>
                    </FadeIn>

                    <div className="grid md:grid-cols-3 gap-6 items-start">
                        {plans.map((plan, i) => (
                            <FadeIn key={i} delay={i * 0.15}>
                                <div className={`border-2 ${plan.color} rounded-2xl p-7 relative transition-all duration-300`}>
                                    {plan.badge && (
                                        <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-xs px-4 py-1.5 rounded-full font-medium shadow-lg">
                                            {plan.badge}
                                        </div>
                                    )}
                                    <h3 className="font-bold text-gray-800 text-xl mb-1">{plan.name}</h3>
                                    <div className="mb-5">
                                        <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                                        <span className="text-gray-400 text-sm ml-2">/ {plan.period}</span>
                                    </div>
                                    <ul className="space-y-3 mb-7">
                                        {plan.features.map((f, j) => (
                                            <li key={j} className="text-sm text-gray-500 flex items-center gap-2">
                                                <span className="text-green-500 text-base">✓</span> {f}
                                            </li>
                                        ))}
                                    </ul>
                                    <button
                                        onClick={() => handlePlanClick(plan)}
                                        className={`w-full py-3 rounded-xl font-medium text-sm transition-all cursor-pointer ${plan.btn}`}
                                    >
                                        {plan.name === 'Trial' ? 'Start Free Trial →' : `Get ${plan.name} Plan →`}
                                    </button>
                                </div>
                            </FadeIn>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-24 px-6 bg-gradient-to-br from-blue-600 to-purple-700 relative overflow-hidden">
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-10 left-10 w-72 h-72 bg-white rounded-full blur-3xl" />
                    <div className="absolute bottom-10 right-10 w-72 h-72 bg-white rounded-full blur-3xl" />
                </div>
                <FadeIn>
                    <div className="max-w-3xl mx-auto text-center relative">
                        <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
                            Ready to automate your business?
                        </h2>
                        <p className="text-blue-100 mb-8 text-lg">
                            Join businesses using Veloxa to serve customers 24/7 — automatically.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <button
                                onClick={() => navigate('/login')}
                                className="bg-white text-blue-600 px-8 py-4 rounded-2xl font-bold text-lg hover:shadow-2xl transition-all hover:-translate-y-0.5"
                            >
                                Start Free Trial 🚀
                            </button>
                            <button
                                onClick={() => setDemoOpen(true)}
                                className="border-2 border-white/40 text-white px-8 py-4 rounded-2xl font-bold text-lg hover:bg-white/10 transition-all"
                            >
                                💬 Try Demo First
                            </button>
                        </div>
                        <p className="text-blue-200 text-xs mt-4">
                            7-days free trial · No credit card · Cancel anytime
                        </p>
                    </div>
                </FadeIn>
            </section>

            {/* FOOTER */}
            <footer className="py-10 px-6 bg-gray-900">
                <div className="max-w-6xl mx-auto">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-8">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                                <span className="text-white text-sm font-bold">V</span>
                            </div>
                            <span className="font-bold text-white text-lg">Veloxa</span>
                        </div>
                        <div className="flex gap-8 text-sm text-gray-400">
                            <a href="#features" className="hover:text-white transition-colors">Features</a>
                            <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
                            <a href="/privacy" className="hover:text-white transition-colors" target='blank'>Privacy Policy</a>
                            <a href="/terms" className="hover:text-white transition-colors" target='blank'>Terms of Service</a>
                        </div>
                    </div>
                    <div className="border-t border-gray-800 pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
                        <p className="text-gray-500 text-sm">
                            © 2026 Veloxa AI. All rights reserved.
                        </p>
                        <p className="text-gray-600 text-xs">
                            AI-powered customer automation · Appointment booking · Lead capture
                        </p>
                    </div>
                </div>
            </footer>

            {/* DEMO MODAL */}
            {demoOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div
                        className="bg-white rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl"
                        style={{ animation: 'slideUp 0.3s ease' }}
                    >
                        <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-3 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                                <span className="text-white font-medium text-sm">Veloxa AI — Live Demo</span>
                            </div>
                            <button onClick={() => setDemoOpen(false)} className="text-white/70 hover:text-white text-lg">✕</button>
                        </div>

                        <div className="h-72 overflow-y-auto p-4 space-y-3 bg-gray-50">
                            {messages.map((m, i) => (
                                <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-xs px-3 py-2 rounded-2xl text-sm leading-relaxed ${m.role === 'user'
                                        ? 'bg-blue-600 text-white rounded-br-sm'
                                        : 'bg-white text-gray-700 rounded-bl-sm shadow-sm border border-gray-100'
                                        }`}>
                                        {m.text}
                                    </div>
                                </div>
                            ))}
                            {typing && (
                                <div className="flex justify-start">
                                    <div className="bg-white text-gray-400 px-4 py-2 rounded-2xl text-sm shadow-sm border border-gray-100">
                                        <span className="animate-pulse">● ● ●</span>
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        <div className="p-3 border-t border-gray-100 bg-white flex gap-2">
                            <input
                                value={input}
                                onChange={e => setInput(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && sendDemo()}
                                placeholder="Try: appointment, timing, price..."
                                className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-blue-400"
                            />
                            <button
                                onClick={sendDemo}
                                className="bg-blue-600 text-white px-4 py-2 rounded-xl text-sm hover:bg-blue-700 transition-all"
                            >
                                ➤
                            </button>
                        </div>

                        <div className="px-4 pb-3 text-center">
                            <button
                                onClick={() => { setDemoOpen(false); navigate('/login'); }}
                                className="text-xs text-blue-600 hover:underline cursor-pointer"
                            >
                                Ready to set this up for your business? Start free →
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* CSS Animations */}
            <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
        </div>
    );
}