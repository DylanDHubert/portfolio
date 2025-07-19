"use client";

import React, { useState } from 'react';
import styles from './Bookshelf.module.scss';

interface Book {
  id: string;
  title: string;
  author: string;
  description: string;
  color: string;
  width: number;
  height: number;
  spineStyle: 'classic' | 'modern' | 'vintage' | 'minimal';
  fontFamily: string;
}

const books: Book[] = [
  {
    id: '1',
    title: 'Hitchhikers Guide to the Galaxy',
    author: 'Douglas Adams',
    description: 'I VERY MUCH ENJOY DRY HUMOR, AND HITCHHIKERS GUIDE ALSO HAS ONE OF MY FAVORITE SENTENCES EVER IN IT "THE SHIPS HUNG IN THE SKY IN MUCH THE SAME WAY THAT BRICKS DON\'T."',
    color: '#8B4513',
    width: 42,
    height: 120,
    spineStyle: 'classic',
    fontFamily: 'Georgia, serif'
  },
  {
    id: '2',
    title: 'Disc World',
    author: 'Terry Pratchett',
    description: 'THIS BOOK SATISFIES MUCH THE SAME ITCH AS HITCHHIKERS GUIDE. WRY HUMOROUS FICTION.',
    color: '#2E8B57',
    width: 48,
    height: 125,
    spineStyle: 'modern',
    fontFamily: 'Arial, sans-serif'
  },
  {
    id: '3',
    title: 'Lord of the Rings',
    author: 'JRR Tolkien',
    description: 'SOME OF THE FIRST FICTION BOOKS I READ.',
    color: '#4682B4',
    width: 45,
    height: 123,
    spineStyle: 'vintage',
    fontFamily: 'Times New Roman, serif'
  },
  {
    id: '4',
    title: 'Calvin and Hobbes',
    author: 'Bill Waterson',
    description: 'A CHILDHOOD, AND ADULTHOOD FAVORITE. CALVIN REMINDS ME TO STAY HAVING FUN.',
    color: '#DC143C',
    width: 52,
    height: 130,
    spineStyle: 'modern',
    fontFamily: 'Courier New, monospace'
  },
  {
    id: '5',
    title: 'Astrix and Obelix',
    author: 'Goscinny & Uderzo',
    description: 'A CLASSIC EUROPEAN CARTOON.',
    color: '#8A2BE2',
    width: 50,
    height: 128,
    spineStyle: 'classic',
    fontFamily: 'Palatino, serif'
  },
  {
    id: '6',
    title: 'Tintin',
    author: 'Herge',
    description: 'ANOTHER CLASSIC EUROPEAN CARTOON.',
    color: '#FF8C00',
    width: 38,
    height: 115,
    spineStyle: 'minimal',
    fontFamily: 'Verdana, sans-serif'
  },
  {
    id: '7',
    title: 'Sapiens',
    author: 'Yuval Noah Harari',
    description: 'A VERY INTERESTING BOOK THAT PROVIDES NEW PERSPECTIVE ON MANY OF THE SYSTEMS WE TAKE FOR GRANTED.',
    color: '#4A90E2',
    width: 44,
    height: 122,
    spineStyle: 'modern',
    fontFamily: 'Futura, sans-serif'
  },
  {
    id: '8',
    title: 'Freakonomics',
    author: 'Levitt & Dubner',
    description: 'A COLLECTION OF HIGHLY INTERESTING STUDIES THAT SCRATCH A SIMILAR ITCH TO SAPIENS.',
    color: '#9B59B6',
    width: 46,
    height: 126,
    spineStyle: 'vintage',
    fontFamily: 'Garamond, serif'
  },
  {
    id: '9',
    title: 'Elements, Reactions, Molecules',
    author: 'Theodore Gray',
    description: 'THE BOOKS THAT SPARKED A LIFELONG INTEREST IN CHEMISTRY',
    color: '#E67E22',
    width: 40,
    height: 118,
    spineStyle: 'classic',
    fontFamily: 'Baskerville, serif'
  },
  {
    id: '10',
    title: 'What If?',
    author: 'Randall Munroe',
    description: 'A CLASSIC BOOK BY A CLASSIC CARTOONIST.',
    color: '#27AE60',
    width: 47,
    height: 124,
    spineStyle: 'modern',
    fontFamily: 'Courier New, monospace'
  },
  {
    id: '11',
    title: 'Outliers',
    author: 'Malcolm Gladwell',
    description: "A BOOK WHO'S THESIS PROVED TRUE THROUGH MY COLLEGE EXPERIENCE.",
    color: '#34495E',
    width: 35,
    height: 110,
    spineStyle: 'minimal',
    fontFamily: 'Times New Roman, serif'
  },
  {
    id: '12',
    title: 'Neuromancer',
    author: 'William Gibson',
    description: 'THE NOVEL THAT DEFINED CYBERPUNK AND INFLUENCED MY VISION OF FUTURE TECHNOLOGY. GIBSON\'S DEPICTION OF AI, VIRTUAL REALITY, AND HUMAN-TECHNOLOGY INTERFACES SHAPES HOW I THINK ABOUT THE FUTURE OF AI SYSTEMS.',
    color: '#E74C3C',
    width: 43,
    height: 121,
    spineStyle: 'vintage',
    fontFamily: 'Arial Black, sans-serif'
  },
  {
    id: '13',
    title: 'Design Patterns',
    author: 'Gang of Four',
    description: 'THE DEFINITIVE GUIDE TO SOFTWARE DESIGN PATTERNS THAT TAUGHT ME HOW TO STRUCTURE COMPLEX SYSTEMS. THESE PATTERNS INFLUENCE HOW I DESIGN AI SYSTEMS AND SOFTWARE ARCHITECTURES.',
    color: '#8E44AD',
    width: 41,
    height: 119,
    spineStyle: 'classic',
    fontFamily: 'Optima, serif'
  },
  {
    id: '14',
    title: 'Refactoring',
    author: 'Martin Fowler',
    description: 'A PRACTICAL GUIDE TO IMPROVING CODE QUALITY THAT INFLUENCES HOW I APPROACH LEGACY SYSTEMS AND TECHNICAL DEBT. FOWLER\'S METHODS ARE ESPECIALLY VALUABLE WHEN WORKING WITH COMPLEX AI SYSTEMS.',
    color: '#16A085',
    width: 39,
    height: 117,
    spineStyle: 'modern',
    fontFamily: 'Helvetica, sans-serif'
  },
  {
    id: '15',
    title: 'The C Programming Language',
    author: 'Kernighan & Ritchie',
    description: 'THE CLASSIC TEXT ON C PROGRAMMING THAT TAUGHT ME THE FUNDAMENTALS OF SYSTEMS PROGRAMMING AND MEMORY MANAGEMENT. THIS KNOWLEDGE IS CRUCIAL FOR UNDERSTANDING HOW COMPUTERS WORK AT A LOW LEVEL.',
    color: '#D35400',
    width: 49,
    height: 127,
    spineStyle: 'vintage',
    fontFamily: 'Courier, monospace'
  },
  {
    id: '16',
    title: 'Introduction to Algorithms',
    author: 'Cormen et al.',
    description: 'THE DEFINITIVE ALGORITHMS TEXTBOOK THAT SHAPED MY UNDERSTANDING OF COMPUTATIONAL COMPLEXITY AND EFFICIENT PROBLEM-SOLVING. THIS KNOWLEDGE IS ESSENTIAL FOR OPTIMIZING AI SYSTEMS.',
    color: '#2980B9',
    width: 53,
    height: 132,
    spineStyle: 'modern',
    fontFamily: 'Bookman, serif'
  },
  {
    id: '17',
    title: 'The Unix Programming Environment',
    author: 'Kernighan & Pike',
    description: 'A MASTERPIECE ON UNIX PHILOSOPHY THAT TAUGHT ME THE POWER OF SIMPLE, COMPOSABLE TOOLS. THIS INFLUENCES HOW I DESIGN MODULAR AI SYSTEMS AND DATA PROCESSING PIPELINES.',
    color: '#7F8C8D',
    width: 37,
    height: 113,
    spineStyle: 'minimal',
    fontFamily: 'Lucida Console, monospace'
  },
  {
    id: '18',
    title: 'The Psychology of Money',
    author: 'Morgan Housel',
    description: 'A FRESH PERSPECTIVE ON DECISION-MAKING AND HUMAN BEHAVIOR THAT INFLUENCES HOW I THINK ABOUT USER INTERFACES AND AI SYSTEM DESIGN. UNDERSTANDING PSYCHOLOGY IS CRUCIAL FOR BUILDING USEFUL TOOLS.',
    color: '#F39C12',
    width: 42,
    height: 120,
    spineStyle: 'classic',
    fontFamily: 'Century Gothic, sans-serif'
  },
  {
    id: '19',
    title: 'The Innovator\'s Dilemma',
    author: 'Clayton Christensen',
    description: 'A FRAMEWORK FOR UNDERSTANDING DISRUPTIVE INNOVATION THAT INFLUENCES HOW I THINK ABOUT TECHNOLOGY ADOPTION AND COMPETITIVE ADVANTAGE IN AI SYSTEMS.',
    color: '#E91E63',
    width: 44,
    height: 122,
    spineStyle: 'modern',
    fontFamily: 'Franklin Gothic, sans-serif'
  },
  {
    id: '20',
    title: 'The Lean Startup',
    author: 'Eric Ries',
    description: 'A METHODOLOGY FOR BUILDING PRODUCTS THAT INFLUENCES HOW I APPROACH AI SYSTEM DEVELOPMENT. THE BUILD-MEASURE-LEARN CYCLE IS ESPECIALLY RELEVANT FOR ITERATIVE AI IMPROVEMENT.',
    color: '#00BCD4',
    width: 36,
    height: 114,
    spineStyle: 'minimal',
    fontFamily: 'Arial, sans-serif'
  },
  {
    id: '21',
    title: 'The Phoenix Project',
    author: 'Gene Kim',
    description: 'A NOVEL ABOUT DEVOPS THAT TAUGHT ME THE IMPORTANCE OF AUTOMATION, MONITORING, AND CONTINUOUS DELIVERY. THESE PRINCIPLES ARE ESSENTIAL FOR DEPLOYING RELIABLE AI SYSTEMS.',
    color: '#795548',
    width: 45,
    height: 123,
    spineStyle: 'vintage',
    fontFamily: 'Georgia, serif'
  },
  {
    id: '22',
    title: 'The Goal',
    author: 'Eliyahu Goldratt',
    description: 'A BUSINESS NOVEL ABOUT THEORY OF CONSTRAINTS THAT INFLUENCES HOW I THINK ABOUT SYSTEM OPTIMIZATION AND BOTTLENECK IDENTIFICATION IN AI PIPELINES.',
    color: '#607D8B',
    width: 33,
    height: 108,
    spineStyle: 'classic',
    fontFamily: 'Gill Sans, sans-serif'
  },
  {
    id: '23',
    title: 'The Machine That Changed the World',
    author: 'Womack et al.',
    description: 'A STUDY OF TOYOTA\'S PRODUCTION SYSTEM THAT INFLUENCES HOW I THINK ABOUT EFFICIENCY, QUALITY, AND CONTINUOUS IMPROVEMENT IN SOFTWARE DEVELOPMENT.',
    color: '#FF5722',
    width: 47,
    height: 125,
    spineStyle: 'modern',
    fontFamily: 'Trebuchet MS, sans-serif'
  },
  {
    id: '24',
    title: 'The Toyota Way',
    author: 'Jeffrey Liker',
    description: 'A DEEPER DIVE INTO LEAN PRINCIPLES THAT SHAPES HOW I APPROACH PROCESS IMPROVEMENT AND QUALITY ASSURANCE IN AI SYSTEM DEVELOPMENT.',
    color: '#9C27B0',
    width: 40,
    height: 118,
    spineStyle: 'vintage',
    fontFamily: 'Tahoma, sans-serif'
  }
];

const Bookshelf: React.FC = () => {
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleBookClick = (book: Book) => {
    setSelectedBook(book);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedBook(null);
  };

  return (
    <div className={styles.bookshelfContainer}>
      <div className={styles.bookshelf}>
        {/* SHELF 1 */}
        <div className={styles.shelf}>
          <div className={styles.booksRow}>
            {books.slice(0, 12).map((book) => (
              <div
                key={book.id}
                className={`${styles.book} ${styles[book.spineStyle]}`}
                style={{
                  width: `${book.width}px`,
                  height: `${book.height}px`,
                  backgroundColor: book.color
                }}
                onClick={() => handleBookClick(book)}
              >
                <div className={styles.bookSpine} style={{ fontFamily: book.fontFamily }}>
                  <div className={styles.bookTitle}>{book.title}</div>
                  <div className={styles.bookAuthor}>{book.author}</div>
                </div>
              </div>
            ))}
          </div>
          <div className={styles.shelfBoard}></div>
        </div>

        {/* SHELF 2 */}
        <div className={styles.shelf}>
          <div className={styles.booksRow}>
            {books.slice(12, 24).map((book) => (
              <div
                key={book.id}
                className={`${styles.book} ${styles[book.spineStyle]}`}
                style={{
                  width: `${book.width}px`,
                  height: `${book.height}px`,
                  backgroundColor: book.color
                }}
                onClick={() => handleBookClick(book)}
              >
                <div className={styles.bookSpine} style={{ fontFamily: book.fontFamily }}>
                  <div className={styles.bookTitle}>{book.title}</div>
                  <div className={styles.bookAuthor}>{book.author}</div>
                </div>
              </div>
            ))}
          </div>
          <div className={styles.shelfBoard}></div>
        </div>

        {/* BASE */}
        <div className={styles.bookshelfBase}></div>
      </div>

      {/* LEGS - Supporting the entire bookshelf */}
      <div className={styles.bookshelfLegs}>
        <div className={styles.bookshelfLeg}></div>
        <div className={styles.bookshelfLeg}></div>
        <div className={styles.bookshelfLeg}></div>
        <div className={styles.bookshelfLeg}></div>
      </div>

      {/* MODAL FOR BOOK DETAILS */}
      {isModalOpen && selectedBook && (
        <div className={styles.modalOverlay} onClick={closeModal}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <button className={styles.closeButton} onClick={closeModal}>
              ×
            </button>
            <div className={styles.modalContent}>
              <h2 className={styles.modalTitle}>{selectedBook.title}</h2>
              <h3 className={styles.modalAuthor}>by {selectedBook.author}</h3>
              <p className={styles.modalDescription}>{selectedBook.description}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Bookshelf; 