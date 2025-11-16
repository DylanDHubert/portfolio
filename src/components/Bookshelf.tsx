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
            {books.slice(0, 11).map((book) => (
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