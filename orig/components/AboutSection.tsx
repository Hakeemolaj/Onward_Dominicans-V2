
import React, { forwardRef } from 'react';
import { SectionProps } from '../types';
import { PUBLICATION_NAME, PUBLICATION_MISSION } from '../constants';

const AboutSection = forwardRef<HTMLDivElement, SectionProps>((props, ref) => {
  return (
    <section 
      ref={ref} 
      id={props.id} 
      className={`py-16 md:py-24 bg-white dark:bg-slate-900 ${props.className || ''}`}
      aria-labelledby="about-publication-heading"
    >
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 id="about-publication-heading" className="text-3xl sm:text-4xl font-extrabold text-slate-800 dark:text-slate-100 text-center mb-12">
          About {PUBLICATION_NAME}
        </h2>
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <img 
              src="https://images.unsplash.com/photo-1455849318743-b2233052fcff?ixlib=rb-4.0.3&auto=format&fit=crop&w=1740&q=80" 
              alt={`${PUBLICATION_NAME} - Our Mission`}
              className="rounded-lg shadow-xl object-cover w-full h-96 md:h-full"
            />
          </div>
          <div className="text-lg text-slate-700 dark:text-slate-300 space-y-6">
            <p className="font-semibold text-yellow-600 dark:text-yellow-400 text-xl">{PUBLICATION_MISSION}</p>
            <p>
              {PUBLICATION_NAME} is dedicated to providing reliable, timely, and engaging news coverage. We believe in the power of storytelling to connect communities and foster understanding. Our team of journalists is committed to upholding the highest standards of ethics and accuracy.
            </p>
            <p>
              Founded on the principles of truth, fairness, and public service, we strive to be your trusted source for local news, in-depth features, and thought-provoking commentary. We cover a wide range of topics that impact our readers, from local government and community events to human interest stories and cultural highlights.
            </p>
            <p>
              We are passionate about journalism and its role in a democratic society. Thank you for supporting {PUBLICATION_NAME}.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
});

export default AboutSection;