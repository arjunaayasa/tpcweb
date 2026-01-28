import { CheckCircle } from '@untitledui/icons';

const benefits = [
  {
    title: 'Proven Track Record',
    description: 'Over 10 years of excellence in tax consulting.',
  },
  {
    title: 'Hybrid AI Approach',
    description: 'Combining human expertise with Owlie Chat efficiency.',
  },
  {
    title: 'Data Security',
    description: 'Enterprise-grade security for your financial data.',
  },
  {
    title: 'Tailored Solutions',
    description: 'Strategies customized to your business needs.',
  },
];

export default function WhyUs() {
  return (
    <section className="bg-primary py-16 md:py-24 overflow-hidden">
      <div className="container mx-auto px-4 md:px-8">
        <div className="flex flex-col md:flex-row gap-12 items-center">
          {/* Left Column: Text */}
          <div className="flex-1">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6 animate-slide-in-left">
              Why Partner with TPC?
            </h2>
            <p
              className="text-neutral-light text-lg leading-relaxed mb-8 max-w-lg animate-slide-in-left"
              style={{ animationDelay: '120ms' }}
            >
              We leverage cutting-edge technology and deep industry knowledge to provide you with the most accurate and efficient tax solutions available.
            </p>
          </div>

          {/* Right Column: Benefits List */}
          <div className="flex-1 w-full">
            <ul className="space-y-6">
              {benefits.map((benefit, index) => (
                <li
                  key={index}
                  style={{ animationDelay: `${index * 140}ms` }}
                  className="flex items-start gap-4 animate-slide-in-right"
                >
                  <div className="bg-white/20 p-2 rounded-full mt-1 shrink-0">
                    <CheckCircle className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-1">
                      {benefit.title}
                    </h3>
                    <p className="text-neutral-light opacity-90">
                      {benefit.description}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
