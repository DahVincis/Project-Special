import React, { useState, useEffect } from 'react';
import { storageUrl } from '../storage';
import Lightbox from './Lightbox';
import './OurWork.css';
import { fetchTestimonials } from '../api';

// Editorial grid. `span` is the desktop column count out of 12; `tall` makes a
// tile claim two rows. Tiles are laid out in source order, so the spans have to
// add up to 12 per visual row or the grid will leave holes.
const galleryImages = [
    { file: 'wilton-living.jpg', alt: 'Living room seen from the upper landing', span: 7, tall: true },
    { file: 'wilton-kitchen-after.jpg', alt: 'Galley kitchen with reclaimed beams', span: 5 },
    { file: 'wilton-shower.jpg', alt: 'Master shower in teal penny tile', span: 5 },
    // Tall: a building at dusk needs vertical room. In a one-row slot this
    // crops to a letterbox band of windows and stops reading as a house.
    { file: 'wilton-rear-night.jpg', alt: 'Rear elevation at dusk', span: 8, tall: true },
    { file: 'wilton-entry.jpg', alt: 'Entryway and open stair', span: 4 },
    { file: 'wilton-dining.jpg', alt: 'Dining room beneath the clerestory windows', span: 4 },
    { file: 'wilton-bedroom.jpg', alt: 'Master bedroom with floating bed', span: 6 },
    { file: 'wilton-vista.jpg', alt: 'Double-height living room and gallery wall', span: 6 },
    { file: 'interior.jpg', alt: 'Interior finish work', span: 6 },
    { file: 'exterior.jpg', alt: 'Exterior finish work', span: 6 },
].map((t) => ({ ...t, src: storageUrl(t.file) }));

// Four rooms, each shot from the same wall before and after.
const pairs = [
    { room: 'Front Elevation', before: 'wilton-front-before.jpg', after: 'wilton-front-after.jpg', note: 'Re-sided in stucco, relit end to end.' },
    { room: 'Kitchen', before: 'wilton-kitchen-before.jpg', after: 'wilton-kitchen-after.jpg', note: 'Taken back to the studs and rebuilt as a galley.' },
    { room: 'Family Room', before: 'wilton-family-before.jpg', after: 'wilton-family-after.jpg', note: 'Bare subfloor to stone hearth and reclaimed beams.' },
    { room: 'Master Bath', before: 'wilton-bath-before.jpg', after: 'wilton-bath-after.jpg', note: 'Demolished to framing, finished in subway tile.' },
];

const pairImages = pairs.flatMap(({ room, before, after }) => [
    { src: storageUrl(before), alt: `${room} before renovation` },
    { src: storageUrl(after), alt: `${room} after renovation` },
]);

const OurWork = () => {
    const [testimonials, setTestimonials] = useState([]);
    const [lightbox, setLightbox] = useState(null);

    useEffect(() => {
        fetchTestimonials().then((data) => setTestimonials(data.testimonials));
    }, []);

    // Lightbox stays scoped to the section it was opened from, so arrowing
    // through it never wanders into another section's photos.
    const openLightbox = (images, index) => setLightbox({ images, index });

    return (
        <div id="work" className="work">
            <section className="work-selected">
                <div className="rule-header" data-num="02">
                    <span className="section-label">Selected Work</span>
                    <h2>Finishes that<br /><em>hold up close.</em></h2>
                </div>

                <div className="work-grid">
                    {galleryImages.map((img, i) => (
                        <button
                            key={img.src}
                            className={`work-tile span-${img.span}${img.tall ? ' is-tall' : ''}`}
                            onClick={() => openLightbox(galleryImages, i)}
                        >
                            <img src={img.src} alt={img.alt} loading="lazy" />
                            <span className="work-tile-caption">{img.alt}</span>
                        </button>
                    ))}
                </div>
            </section>

            <section className="case">
                <div className="case-intro">
                    <div className="rule-header" data-num="03">
                        <span className="section-label">Case Study</span>
                        <h2>A 1970s modernist,<br /><em>rebuilt.</em></h2>
                    </div>
                    <p className="case-lede">
                        A glass-and-stucco house in Wilton, Connecticut, left half-demolished
                        by its previous owners — no kitchen, no bathrooms, and no bank willing
                        to write a mortgage against it. Special Finishes took it from
                        demolition through permitting, construction and decorating.
                    </p>
                    <dl className="case-stats">
                        <div>
                            <dt>Start to finish</dt>
                            <dd>70 days</dd>
                        </div>
                        <div>
                            <dt>Scope</dt>
                            <dd>Full gut</dd>
                        </div>
                        <div>
                            <dt>Completed</dt>
                            <dd>2022</dd>
                        </div>
                    </dl>
                </div>

                <div className="case-pairs">
                    {pairs.map(({ room, before, after, note }, i) => (
                        <figure className="pair" key={room}>
                            <div className="pair-images">
                                <button
                                    className="pair-shot"
                                    onClick={() => openLightbox(pairImages, i * 2)}
                                >
                                    <img src={storageUrl(before)} alt={`${room} before renovation`} loading="lazy" />
                                    <span className="pair-tag">Before</span>
                                </button>
                                <button
                                    className="pair-shot"
                                    onClick={() => openLightbox(pairImages, i * 2 + 1)}
                                >
                                    <img src={storageUrl(after)} alt={`${room} after renovation`} loading="lazy" />
                                    <span className="pair-tag is-after">After</span>
                                </button>
                            </div>
                            <figcaption>
                                <span className="pair-room">{room}</span>
                                <span className="pair-note">{note}</span>
                            </figcaption>
                        </figure>
                    ))}
                </div>
            </section>

            <section className="quotes">
                <div className="rule-header" data-num="04">
                    <span className="section-label">Client Feedback</span>
                </div>
                <div className="quote-list">
                    {testimonials.map((t) => (
                        <blockquote className="quote" key={t.client}>
                            <p>{t.text}</p>
                            <cite>{t.client}</cite>
                        </blockquote>
                    ))}
                </div>
            </section>

            {lightbox && (
                <Lightbox
                    images={lightbox.images}
                    index={lightbox.index}
                    onClose={() => setLightbox(null)}
                    onNavigate={(index) => setLightbox((lb) => ({ ...lb, index }))}
                />
            )}
        </div>
    );
};

export default OurWork;
