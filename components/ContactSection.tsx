
import React, { forwardRef, useState } from 'react';
import { SectionProps } from '../types';
import { PUBLICATION_NAME, PUBLICATION_CONTACT_EMAIL } from '../constants';
import { getAIEditorResponse } from '../services/aiService';
import LoadingSpinner from './LoadingSpinner';
import ErrorMessage from './ErrorMessage';

interface FormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  subject?: string;
  message?: string;
}

const ContactSection = forwardRef<HTMLDivElement, SectionProps>((props, ref) => {
  const [formData, setFormData] = useState<FormData>({ name: '', email: '', subject: '', message: '' });
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const [aiQuestion, setAiQuestion] = useState('');
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [isAIQueryLoading, setIsAIQueryLoading] = useState(false);
  const [aiQueryError, setAiQueryError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (formErrors[name as keyof FormErrors]) {
      setFormErrors(prev => ({ ...prev, [name]: undefined }));
    }
    setSubmitSuccess(false);
  };

  const validateForm = (): boolean => {
    const errors: FormErrors = {};
    if (!formData.name.trim()) errors.name = "Full name is required.";
    if (!formData.email.trim()) {
      errors.email = "Email address is required.";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = "Email address is invalid.";
    }
    if (!formData.subject.trim()) errors.subject = "Subject is required.";
    if (!formData.message.trim()) {
      errors.message = "Message is required.";
    } else if (formData.message.trim().length < 10) {
      errors.message = "Message should be at least 10 characters long.";
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitSuccess(false);
    if (!validateForm()) return;

    setIsSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 1500)); 
    
    setIsSubmitting(false);
    setSubmitSuccess(true);
    setFormData({ name: '', email: '', subject: '', message: '' });
    setFormErrors({});
  };

  const handleAIQuestionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAiQuestion(e.target.value);
    setAiResponse(null); 
    setAiQueryError(null);
  };

  const handleAIQuerySubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!aiQuestion.trim()) {
      setAiQueryError("Please enter a question.");
      return;
    }
    setIsAIQueryLoading(true);
    setAiResponse(null);
    setAiQueryError(null);
    try {
      const response = await getAIEditorResponse(aiQuestion);
      setAiResponse(response);
    } catch (error) {
      if (error instanceof Error) {
        setAiQueryError(error.message);
      } else {
        setAiQueryError("An unexpected error occurred.");
      }
    } finally {
      setIsAIQueryLoading(false);
    }
  };

  const inputBaseClasses = "mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none sm:text-sm";
  const inputNormalClasses = "border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:ring-yellow-500 focus:border-yellow-500 dark:focus:ring-yellow-400 dark:focus:border-yellow-400";
  const inputErrorClasses = "border-red-500 dark:border-red-400 focus:ring-red-500 focus:border-red-500 dark:focus:ring-red-400 dark:focus:border-red-400";
  const labelClasses = "block text-sm font-medium text-slate-600 dark:text-slate-300";

  return (
    <section 
      ref={ref} 
      id={props.id} 
      className={`py-16 md:py-24 bg-white dark:bg-slate-900 ${props.className || ''}`}
      aria-labelledby="contact-publication-heading"
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 id="contact-publication-heading" className="text-3xl sm:text-4xl font-extrabold text-slate-800 dark:text-slate-100 text-center mb-12">
          Contact Us
        </h2>
        <div className="grid md:grid-cols-2 gap-12 items-start">
          <div className="bg-slate-50 dark:bg-slate-800 p-6 md:p-8 rounded-lg shadow-lg dark:shadow-slate-900/50">
            <h3 className="text-2xl font-semibold text-slate-700 dark:text-slate-100 mb-6">Send a Message to the Editors</h3>
            <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">
              Have a news tip, story idea, or feedback on our publication? We'd love to hear from you.
            </p>
            <form onSubmit={handleFormSubmit} className="space-y-4" noValidate>
              <div>
                <label htmlFor="name" className={labelClasses}>Full Name</label>
                <input type="text" name="name" id="name" value={formData.name} onChange={handleChange}
                  className={`${inputBaseClasses} ${formErrors.name ? inputErrorClasses : inputNormalClasses}`}
                  aria-invalid={!!formErrors.name} aria-describedby={formErrors.name ? "name-error" : undefined} />
                {formErrors.name && <p id="name-error" className="mt-1 text-xs text-red-600 dark:text-red-400">{formErrors.name}</p>}
              </div>
              <div>
                <label htmlFor="email" className={labelClasses}>Email Address</label>
                <input type="email" name="email" id="email" value={formData.email} onChange={handleChange}
                  className={`${inputBaseClasses} ${formErrors.email ? inputErrorClasses : inputNormalClasses}`}
                  aria-invalid={!!formErrors.email} aria-describedby={formErrors.email ? "email-error" : undefined} />
                {formErrors.email && <p id="email-error" className="mt-1 text-xs text-red-600 dark:text-red-400">{formErrors.email}</p>}
              </div>
              <div>
                <label htmlFor="subject" className={labelClasses}>Subject</label>
                <input type="text" name="subject" id="subject" value={formData.subject} onChange={handleChange}
                  className={`${inputBaseClasses} ${formErrors.subject ? inputErrorClasses : inputNormalClasses}`}
                  aria-invalid={!!formErrors.subject} aria-describedby={formErrors.subject ? "subject-error" : undefined} />
                {formErrors.subject && <p id="subject-error" className="mt-1 text-xs text-red-600 dark:text-red-400">{formErrors.subject}</p>}
              </div>
              <div>
                <label htmlFor="message" className={labelClasses}>Message</label>
                <textarea name="message" id="message" rows={5} value={formData.message} onChange={handleChange}
                  className={`${inputBaseClasses} ${formErrors.message ? inputErrorClasses : inputNormalClasses}`}
                  aria-invalid={!!formErrors.message} aria-describedby={formErrors.message ? "message-error" : undefined}></textarea>
                {formErrors.message && <p id="message-error" className="mt-1 text-xs text-red-600 dark:text-red-400">{formErrors.message}</p>}
              </div>
              <div>
                <button type="submit" disabled={isSubmitting}
                  className="w-full px-6 py-3 bg-yellow-500 text-slate-900 font-semibold rounded-lg shadow-md hover:bg-yellow-400 dark:bg-yellow-400 dark:hover:bg-yellow-500 dark:text-slate-900 transition-colors duration-300 disabled:opacity-70 disabled:cursor-not-allowed">
                  {isSubmitting ? 'Submitting...' : 'Submit Message'}
                </button>
              </div>
              {submitSuccess && (
                <p className="text-sm text-green-700 bg-green-100 dark:text-green-300 dark:bg-green-900/50 p-3 rounded-md border border-green-300 dark:border-green-700 text-center">
                  Thank you! Your message has been sent to our editorial team.
                </p>
              )}
            </form>
          </div>

          <div className="space-y-6">
            <div className="bg-slate-50 dark:bg-slate-800 p-6 md:p-8 rounded-lg shadow-lg dark:shadow-slate-900/50">
              <h3 className="text-2xl font-semibold text-slate-700 dark:text-slate-100 mb-4">Quick Answers from Our AI Assistant</h3>
              <p className="text-sm text-slate-600 dark:text-slate-300 mb-6">
                Have a quick question about {PUBLICATION_NAME}? Ask our AI assistant!
              </p>
              <form onSubmit={handleAIQuerySubmit} className="space-y-4">
                <div>
                  <label htmlFor="ai-question" className={labelClasses}>Your Question</label>
                  <input 
                    type="text" 
                    id="ai-question" 
                    name="ai-question"
                    value={aiQuestion}
                    onChange={handleAIQuestionChange}
                    className={`${inputBaseClasses} ${inputNormalClasses}`}
                    placeholder="e.g., How do I submit a story idea?"
                    aria-describedby="ai-response-area"
                  />
                </div>
                <div>
                  <button 
                    type="submit" 
                    disabled={isAIQueryLoading}
                    className="w-full px-6 py-3 bg-yellow-500 text-slate-900 font-semibold rounded-lg shadow-md hover:bg-yellow-400 dark:bg-yellow-400 dark:hover:bg-yellow-500 dark:text-slate-900 transition-colors duration-300 disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {isAIQueryLoading ? 'Thinking...' : 'Ask AI Assistant'}
                  </button>
                </div>
              </form>
              <div id="ai-response-area" aria-live="polite" className="mt-6">
                {isAIQueryLoading && <LoadingSpinner />}
                {aiQueryError && <ErrorMessage message={aiQueryError} />}
                {aiResponse && !isAIQueryLoading && !aiQueryError && (
                  <div className="bg-white dark:bg-slate-700 p-4 rounded-md shadow border border-slate-200 dark:border-slate-600">
                    <p className="text-sm font-semibold text-slate-700 dark:text-slate-100 mb-2">AI Assistant says:</p>
                    <p className="text-sm text-slate-600 dark:text-slate-300 whitespace-pre-wrap">{aiResponse}</p>
                  </div>
                )}
              </div>
            </div>

            <div className="text-slate-700 dark:text-slate-300 space-y-4 mt-8">
              <h3 className="text-2xl font-semibold text-slate-700 dark:text-slate-100 mb-2">Editorial Office</h3>
              <p>
                <strong>{PUBLICATION_NAME}</strong>
              </p>
              <p>
                For general inquiries, corrections, or to reach our editorial staff, please use the form or contact us via email.
              </p>
              <p>
                <strong>Email:</strong><br />
                <a href={`mailto:${PUBLICATION_CONTACT_EMAIL}`} className="text-yellow-600 hover:text-yellow-700 dark:text-yellow-400 dark:hover:text-yellow-500 hover:underline">{PUBLICATION_CONTACT_EMAIL}</a>
              </p>
              <p>
                <strong>Mailing Address (Example):</strong><br />
                P.O. Box 123, News City, NC 45678
              </p>
              <p className="text-sm mt-4">
                We value your readership and input. For advertising inquiries, please direct your email to ads@onwarddominicans.news (example).
              </p>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
});

export default ContactSection;