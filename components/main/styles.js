import styled, { keyframes } from "styled-components";
import Image from "next/image";

// Animations
export const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
`;

export const rotate = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

// Main section styled components
export const HeroSection = styled.section`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 5rem 5%;
  position: relative;
  max-width: 1400px;
  margin: 0 auto;
  width: 100%;

  @media (min-width: 768px) {
    padding: 8rem 5%;
  }
`;

export const Title = styled.h1`
  font-size: clamp(2.5rem, 8vw, 4.5rem);
  margin-bottom: 2rem;
  color: #ffffff;
  font-weight: 300;
  max-width: 800px;
  line-height: 1.1;
  animation: ${fadeIn} 1s ease-out;
`;

export const Subtitle = styled.p`
  font-size: 1.1rem;
  color: #aaaaaa;
  max-width: 500px;
  margin-bottom: 3rem;
  line-height: 1.6;
  font-weight: 300;
  animation: ${fadeIn} 1s ease-out 0.2s forwards;
  opacity: 0;
`;

// Projects section
export const ProjectsSection = styled.section`
  padding: 5rem 5%;
  background-color: #1e1e1e;
  max-width: 100%;
`;

export const SectionInner = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  width: 100%;
`;

export const SectionTitle = styled.h2`
  font-size: 1.5rem;
  color: #ffffff;
  margin-bottom: 4rem;
  position: relative;
  font-weight: 400;
  text-transform: uppercase;
  letter-spacing: 2px;
`;

export const ProjectGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 3rem;

  @media (min-width: 768px) {
    grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  }
`;

export const ProjectCard = styled.div`
  background-color: transparent;
  transition: transform 0.3s ease;

  &:hover {
    transform: translateY(-10px);
  }
`;

export const ProjectImage = styled.div`
  width: 100%;
  height: 300px;
  position: relative;
  background-color: #252525;
  overflow: hidden;
  margin-bottom: 1rem;
`;

export const ProjectContent = styled.div`
  padding: 1rem 0;
`;

export const ProjectTitle = styled.h3`
  font-size: 1.25rem;
  margin-bottom: 0.5rem;
  color: #ffffff;
  font-weight: 400;
`;

export const ProjectDescription = styled.p`
  font-size: 0.9rem;
  color: #aaaaaa;
  margin-bottom: 1rem;
  line-height: 1.6;
`;

export const TagContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
`;

export const Tag = styled.span`
  padding: 0.25rem 0.5rem;
  background-color: transparent;
  color: #888;
  border: 1px solid #333;
  font-size: 0.7rem;
  font-weight: 400;
  letter-spacing: 1px;
  text-transform: uppercase;
`;

// Contact section
export const ContactSection = styled.section`
  background: #121212;
  padding: 6rem 5%;
  text-align: left;
  max-width: 1400px;
  margin: 0 auto;
  width: 100%;
`;

export const ContactTitle = styled.h2`
  color: #ffffff;
  margin-bottom: 1.5rem;
  font-size: 1.5rem;
  font-weight: 400;
  text-transform: uppercase;
  letter-spacing: 2px;
`;

export const ContactText = styled.p`
  color: #aaaaaa;
  margin-bottom: 2.5rem;
  max-width: 500px;
  line-height: 1.6;
`;

export const ContactLink = styled.a`
  color: #ffffff;
  font-size: 1.1rem;
  text-decoration: none;
  position: relative;
  
  &::after {
    content: "";
    position: absolute;
    bottom: -5px;
    left: 0;
    width: 100%;
    height: 1px;
    background-color: #ffffff;
  }
  
  &:hover {
    opacity: 0.7;
  }
`;

export const SocialLinksContainer = styled.div`
  display: flex;
  gap: 2rem;
  margin-top: 4rem;
`;

export const SocialLink = styled.a`
  color: #aaaaaa;
  text-decoration: none;
  position: relative;
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 1px;
  
  &::after {
    content: "";
    position: absolute;
    bottom: -3px;
    left: 0;
    width: 0;
    height: 1px;
    background-color: #ffffff;
    transition: width 0.3s ease;
  }
  
  &:hover {
    color: #ffffff;
    &::after {
      width: 100%;
    }
  }
`; 