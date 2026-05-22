const staticData = {
  about: {
    data: {
      name: 'Special Finishes',
      description:
        'We specialize in high-quality interior and exterior finishes that transform any space into something extraordinary. From smooth plaster to decorative coatings, we bring craftsmanship and creativity to every project.',
    },
  },
  testimonials: {
    testimonials: [
      { text: 'Outstanding work! Special Finishes transformed our living room beyond our expectations.', client: 'John D.' },
      { text: 'Professional, on time, and the results were absolutely stunning.', client: 'Maria S.' },
      { text: 'The attention to detail is unmatched. Our office looks incredible now.', client: 'Carlos R.' },
    ],
  },
  interiorExterior: {
    data: {
      title: 'Interior & Exterior Design',
      description:
        'We offer a full range of specialty finishes for both interior and exterior surfaces. Our team brings expertise and passion to every project, ensuring lasting beauty and quality.',
    },
  },
  owner: {
    owner: {
      name: 'Rafael Figueroa',
      description:
        'With over 15 years of experience in specialty finishes, Rafael founded Special Finishes with a commitment to excellence and an eye for detail. His passion for craftsmanship drives every project from start to finish.',
    },
  },
};

export const fetchAboutCompany = async () => staticData.about;
export const fetchOurWork = async () => ({});
export const fetchTestimonials = async () => staticData.testimonials;
export const fetchMeetOwner = async () => staticData.owner;
export const fetchInteriorExterior = async () => staticData.interiorExterior;
