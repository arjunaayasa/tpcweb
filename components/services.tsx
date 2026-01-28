import { Briefcase01, Shield01, CpuChip01 } from '@untitledui/icons';

const services = [
  {
    title: "Tax Consulting",
    description: "Expert guidance for complex tax regulations.",
    icon: Briefcase01,
  },
  {
    title: "Audit Assistance",
    description: "Comprehensive support during tax audits.",
    icon: Shield01,
  },
  {
    title: "AI Tech Integration",
    description: "Modernizing finance with TPC AI tools.",
    icon: CpuChip01,
  },
];

export default function Services() {
  return (
    <section className="py-20 bg-neutral-light">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16 animate-fade-up">
          <h2 className="text-4xl font-bold text-text-dark">Our Expertise</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <div
              key={index}
              style={{ animationDelay: `${index * 140}ms` }}
              className="bg-white p-8 rounded-2xl shadow-lg transition-all duration-300 border border-transparent hover:border-primary/10 hover:-translate-y-1 hover:shadow-xl animate-fade-up"
            >
              <div className="flex justify-center mb-6">
                <service.icon className="w-12 h-12 text-primary" />
              </div>
              <h3 className="text-2xl font-bold text-text-dark mb-4 text-center">
                {service.title}
              </h3>
              <p className="text-gray-600 text-center text-lg">
                {service.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
