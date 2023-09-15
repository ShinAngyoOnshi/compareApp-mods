'use client'
import React, { useState } from 'react';
import Link from 'next/link'

import styles from './page.module.css';

export default function Home() {
 
  return (
    <main className={styles.main}>
      <div>
        <ul>
          <li>
            <Link href="/decks">Decks</Link>
          </li>
          <li>
            <Link href="/decks">DeeJay</Link>
          </li>
          <li>
            <Link href="/decks">PopRock</Link>
          </li>
        </ul>
      </div>
    </main>
  );
}
