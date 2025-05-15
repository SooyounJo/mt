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
        <ContactLink href="mailto:design@minimal.com">
          design@minimal.com
        </ContactLink>
      </ContactSection>
    </>
  );
};

export default MainComponent; 