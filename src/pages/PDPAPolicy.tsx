import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Shield, Mail, MapPin, User } from 'lucide-react';

export function PDPAPolicy() {
    return (
        <div className="min-h-screen bg-[var(--color-surface)]">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <Link
                    to="/"
                    className="inline-flex items-center gap-2 text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] mb-8 transition-colors cursor-pointer"
                >
                    <ArrowLeft size={20} />
                    Back to Home
                </Link>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-2xl shadow-md border border-[var(--color-border)] overflow-hidden"
                >
                    <div className="bg-gradient-to-br from-[var(--color-primary-600)] to-[var(--color-primary-800)] p-8 text-white">
                        <div className="flex items-center gap-3 mb-4">
                            <Shield size={32} />
                            <h1 className="text-3xl font-bold">PDPA Privacy Policy</h1>
                        </div>
                        <p className="text-white/80">
                            Personal Data Protection Act Compliance
                        </p>
                    </div>

                    <div className="p-8 space-y-8">
                        <section>
                            <h2 className="text-xl font-semibold text-[var(--color-text-primary)] mb-4">
                                1. Introduction
                            </h2>
                            <p className="text-[var(--color-text-secondary)] leading-relaxed">
                                AppScore Judge ("we", "our", or "us") is committed to protecting your personal data in accordance with the Personal Data Protection Act 2010 (PDPA) of Malaysia. This Privacy Policy explains how we collect, use, disclose, and protect your personal information when you use our application evaluation platform.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-[var(--color-text-primary)] mb-4">
                                2. Personal Data We Collect
                            </h2>
                            <p className="text-[var(--color-text-secondary)] leading-relaxed mb-3">
                                We may collect the following types of personal data:
                            </p>
                            <ul className="list-disc list-inside text-[var(--color-text-secondary)] space-y-2 ml-4">
                                <li>Name and contact information (email address)</li>
                                <li>Account credentials (encrypted password)</li>
                                <li>App submission data (app names, URLs, descriptions, screenshots)</li>
                                <li>Usage data and analytics</li>
                                <li>Device and browser information</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-[var(--color-text-primary)] mb-4">
                                3. Purpose of Data Collection
                            </h2>
                            <p className="text-[var(--color-text-secondary)] leading-relaxed mb-3">
                                We collect and process your personal data for the following purposes:
                            </p>
                            <ul className="list-disc list-inside text-[var(--color-text-secondary)] space-y-2 ml-4">
                                <li>To create and manage your user account</li>
                                <li>To provide AI-powered app evaluation services</li>
                                <li>To generate and store evaluation reports</li>
                                <li>To improve our services and user experience</li>
                                <li>To communicate with you about your account and services</li>
                                <li>To comply with legal obligations</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-[var(--color-text-primary)] mb-4">
                                4. Data Protection Measures
                            </h2>
                            <p className="text-[var(--color-text-secondary)] leading-relaxed">
                                We implement appropriate technical and organizational security measures to protect your personal data against unauthorized access, alteration, disclosure, or destruction. This includes encryption, secure servers, and access controls.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-[var(--color-text-primary)] mb-4">
                                5. Data Retention
                            </h2>
                            <p className="text-[var(--color-text-secondary)] leading-relaxed">
                                We retain your personal data only for as long as necessary to fulfill the purposes for which it was collected, or as required by law. When your data is no longer needed, we will securely delete or anonymize it.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-[var(--color-text-primary)] mb-4">
                                6. Disclosure to Third Parties
                            </h2>
                            <p className="text-[var(--color-text-secondary)] leading-relaxed">
                                We do not sell, trade, or rent your personal data to third parties. We may share your data with trusted service providers who assist us in operating our platform, subject to confidentiality agreements and only for the purposes described in this policy.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-[var(--color-text-primary)] mb-4">
                                7. Your Rights
                            </h2>
                            <p className="text-[var(--color-text-secondary)] leading-relaxed mb-3">
                                Under the PDPA, you have the right to:
                            </p>
                            <ul className="list-disc list-inside text-[var(--color-text-secondary)] space-y-2 ml-4">
                                <li>Access your personal data held by us</li>
                                <li>Request correction of inaccurate or incomplete data</li>
                                <li>Withdraw consent for data processing</li>
                                <li>Request deletion of your personal data</li>
                                <li>Lodge a complaint with the relevant authority</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-[var(--color-text-primary)] mb-4">
                                8. Cookies and Tracking
                            </h2>
                            <p className="text-[var(--color-text-secondary)] leading-relaxed">
                                We use cookies and similar tracking technologies to enhance your experience on our platform. You can control cookie preferences through your browser settings.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-[var(--color-text-primary)] mb-4">
                                9. Changes to This Policy
                            </h2>
                            <p className="text-[var(--color-text-secondary)] leading-relaxed">
                                We may update this Privacy Policy from time to time. Any changes will be posted on this page with an updated revision date. We encourage you to review this policy periodically.
                            </p>
                        </section>

                        <section className="bg-[var(--color-surface-elevated)] rounded-xl p-6">
                            <h2 className="text-xl font-semibold text-[var(--color-text-primary)] mb-4">
                                10. Contact Us
                            </h2>
                            <p className="text-[var(--color-text-secondary)] leading-relaxed mb-4">
                                If you have any questions about this Privacy Policy or wish to exercise your rights, please contact us:
                            </p>
                            <div className="space-y-3">
                                <div className="flex items-center gap-3 text-[var(--color-text-secondary)]">
                                    <div className="w-10 h-10 rounded-lg bg-[var(--color-primary-100)] flex items-center justify-center">
                                        <img src="/kadosh-ai-icon.png" alt="Kadosh AI" className="w-24 h-6" />
                                    </div>
                                    <span className="font-medium text-[var(--color-text-primary)]">Kadosh AI</span>
                                </div>
                                <div className="flex items-center gap-3 text-[var(--color-text-secondary)]">
                                    <div className="w-10 h-10 rounded-lg bg-[var(--color-primary-100)] flex items-center justify-center">
                                        <Mail size={20} className="text-[var(--color-primary-600)]" />
                                    </div>
                                    <a href="mailto:asha@kadoshai.com" className="hover:text-[var(--color-primary-600)] transition-colors">
                                        asha@kadoshai.com
                                    </a>
                                </div>
                                <div className="flex items-center gap-3 text-[var(--color-text-secondary)]">
                                    <div className="w-10 h-10 rounded-lg bg-[var(--color-primary-100)] flex items-center justify-center">
                                        <MapPin size={20} className="text-[var(--color-primary-600)]" />
                                    </div>
                                    <span>Petaling Jaya, Malaysia</span>
                                </div>
                                <div className="flex items-center gap-3 text-[var(--color-text-secondary)]">
                                    <div className="w-10 h-10 rounded-lg bg-[var(--color-primary-100)] flex items-center justify-center">
                                        <User size={20} className="text-[var(--color-primary-600)]" />
                                    </div>
                                    <span>Data Protection Officer: Colin Benedict Raj</span>
                                </div>
                            </div>
                        </section>

                        <div className="pt-6 border-t border-[var(--color-border)] flex items-center justify-center gap-2 text-sm text-[var(--color-text-muted)]">
                            <span>Powered by</span>
                            <img src="/kadosh-ai-icon.png" alt="Kadosh AI" className="w-24 h-6" />
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
