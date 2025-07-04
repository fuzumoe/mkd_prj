import { Users, Leaf, Star } from "lucide-react";
import "../about.css";

const About = () => {
  const teamMembers = [
    {
      name: "Safia Mustafa",
      title: "CEO",
      image: "/home/ceo.jpg",
      bio: "Visionary leader with 15+ years in sustainable beauty innovation."
    },
    {
      name: "Mamoona Nighat",
      title: "COO",
      image: "/home/coo.jpg",
      bio: "Operations expert specializing in ethical supply chain management."
    },
    {
      name: "Amna Azhar",
      title: "Business & Research Lead",
      image: "/home/bus&res.jpg",
      bio: "Leading our research and development with 15+ years of experience."
    },
  ];

  const values = [
    {
      icon: <Leaf className="icon icon-leaf" />,
      title: "Sustainability",
      description: "Our products are created with respect for both people and planet."
    },
    {
      icon: <Star className="icon icon-star" />,
      title: "Innovation",
      description: "We blend cutting-edge AI with nature's wisdom for optimal results."
    },
    {
      icon: <Users className="icon icon-users" />,
      title: "Inclusivity",
      description: "Personalized skincare solutions for every skin type and tone."
    }
  ];

  return (
    <div className="container">
      {/* Hero Section */}
      <div className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">
          Transforming Skincare Through <span className="highlight">Nature & Science</span>
          </h1>
          <p className="hero-subtitle">
          At Aurora Organics, we blend cutting-edge technology with nature's finest ingredients 
          to create personalized skincare solutions that work in harmony with your skin.
          </p>
        </div>
      </div>

      {/* Mission Section */}
      <div className="section">
        <div className="section-header">
          <h2 className="section-title">Our Mission</h2>
          <div className="divider"></div>
        </div>
        
        <div className="card mission-card">
          <p className="mission-text">
            At Aurora Organics, we empower individuals with cutting-edge AI technology and the finest organic products to achieve radiant, healthy skin. Our AI Skin Analyzer offers precise assessments tailored to your unique needs, combining advanced image analysis with user inputs to deliver highly personalized solutions.
          </p>
          <p className="mission-text">
            We believe every skin story is unique. That's why we focus on crafting solutions that are effective, kind to your skin, and environmentally conscious. From detailed diagnostics to expert consultations, we guide you on every step of your skincare journey with transparency, excellence, and continuous improvement.
          </p>
          <p className="mission-emphasis">
            Experience the future of skincare with Aurora Organics—where your beauty begins.
          </p>
        </div>
      </div>

      {/* Values Section */}
      <div className="section">
        <div className="section-header">
          <h2 className="section-title">Our Values</h2>
          <div className="divider"></div>
        </div>
        
        <div className="values-grid">
          {values.map((value, index) => (
            <div key={index} className="value-card">
              <div className="icon-container">
                {value.icon}
              </div>
              <h3 className="value-title">{value.title}</h3>
              <p className="value-description">{value.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Team Section */}
      <div className="section">
        <div className="section-header">
          <h2 className="section-title">Our Team</h2>
          <div className="divider"></div>
          <p className="section-subtitle">Meet the visionaries behind Aurora Organics</p>
        </div>
  
        <div className="team-grid">
          {teamMembers.map((member, index) => (
            <div key={index} className="team-card">
              <div className="member-image-container">
                <img
                  src={member.image}
                  alt={member.name}
                  className="member-image"
                />
              </div>
              <div className="member-info">
                <h3 className="member-name">{member.name}</h3>
                <p className="member-title">{member.title}</p>
                <p className="member-bio">{member.bio}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default About;