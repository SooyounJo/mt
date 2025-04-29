import React from 'react';
import Image from 'next/image';
import {
  HeroSection,
  Title,
  Subtitle,
  ProjectsSection,
  SectionInner,
  SectionTitle,
  ProjectGrid,
  ProjectCard,
  ProjectImage,
  ProjectContent,
  ProjectTitle,
  ProjectDescription,
  TagContainer,
  Tag,
  ContactSection,
  ContactTitle,
  ContactText,
  ContactLink,
  SocialLinksContainer,
  SocialLink
} from './styles';

// 프로젝트 데이터
const projects = [
  {
    title: "Basic Line Series",
    description: "A line of essential daily products with minimal design.",
    tags: ["Product Design", "Lifestyle", "Minimal"],
    image: "/fort1.png"
  },
  {
    title: "Monochrome Collection",
    description: "Simple furniture collection utilizing black and white contrast.",
    tags: ["Furniture Design", "Monochrome", "Interior"],
    image: "/fort2.png"
  },
  {
    title: "Essential Kitchenware",
    description: "Kitchen utensil series focused on essential functions, removing unnecessary elements.",
    tags: ["Kitchenware", "Functionality", "Simple"],
    image: "/fort3.png"
  },
  {
    title: "Minimum Office",
    description: "Office product design considering efficiency and aesthetics of the workspace.",
    tags: ["Office", "Desk", "Productivity"],
    image: "/fort1.png"
  }
];

const MainComponent = () => {
  return (
    <>
      <HeroSection>
        <Title>Minimalist Product Design</Title>
        <Subtitle>
          A product design studio pursuing harmony between function and form by removing unnecessary elements.
          Experience the beauty found in simplicity.
        </Subtitle>
      </HeroSection>

      <ProjectsSection id="projects">
        <SectionInner>
          <SectionTitle>Projects</SectionTitle>
          <ProjectGrid>
            {projects.map((project, index) => (
              <ProjectCard key={index}>
                <ProjectImage>
                  <Image 
                    src={project.image} 
                    alt={project.title}
                    fill
                    style={{ objectFit: 'cover' }}
                  />
                </ProjectImage>
                <ProjectContent>
                  <ProjectTitle>{project.title}</ProjectTitle>
                  <ProjectDescription>{project.description}</ProjectDescription>
                  <TagContainer>
                    {project.tags.map((tag, i) => (
                      <Tag key={i}>{tag}</Tag>
                    ))}
                  </TagContainer>
                </ProjectContent>
              </ProjectCard>
            ))}
          </ProjectGrid>
        </SectionInner>
      </ProjectsSection>

      <ContactSection id="contact">
        <ContactTitle>Contact</ContactTitle>
        <ContactText>
          For project inquiries or collaboration proposals, please email us.
          We bring your vision to life with simple and functional design.
        </ContactText>
        <ContactLink href="mailto:design@minimal.com">
          design@minimal.com
        </ContactLink>
        <SocialLinksContainer>
          <SocialLink href="#" aria-label="Instagram">Instagram</SocialLink>
          <SocialLink href="#" aria-label="LinkedIn">LinkedIn</SocialLink>
          <SocialLink href="#" aria-label="Behance">Behance</SocialLink>
        </SocialLinksContainer>
      </ContactSection>
    </>
  );
};

export default MainComponent; 