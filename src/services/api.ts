/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ProApiResponse, SearchPlayersResponse } from '../types';

const PRO_API_KEYS = [
  'wz2rvdkTS_T6HfZZhIJ94f3dtMWdK7gdaoMOeLMfilM',
  'tdi7hjUsY1AnNfHGNcFtlEfYiUQahx6Sk0LE78V-lD8'
];

const BASE_URL = 'https://proapis.hlgamingofficial.com/main/games/freefire/account/api';
const OLD_BASE_URL = 'https://freefireinfo-zy9l.onrender.com/api/v1';

let currentKeyIndex = 0;

export async function getPlayerAllData(uid: string, region: string = 'BD'): Promise<ProApiResponse> {
  let lastError: any = null;

  // Try each key until success or all fail
  for (let i = 0; i < PRO_API_KEYS.length; i++) {
    const keyIndex = (currentKeyIndex + i) % PRO_API_KEYS.length;
    const key = PRO_API_KEYS[keyIndex];
    
    try {
      const url = `${BASE_URL}?sectionName=AllData&PlayerUid=${uid}&region=${region.toLowerCase()}&api=${key}`;
      const response = await fetch(url);
      
      if (response.status === 429) {
        console.warn(`Rate limit hit for key index ${keyIndex}, rotating...`);
        continue;
      }

      if (!response.ok) {
        throw new Error(`API lookup failed with status: ${response.status}`);
      }

      const data = await response.json();
      
      // Check if API returned an error in the body
      if (data.status === 'failed' || !data.result) {
        throw new Error(data.message || 'Lookup failed');
      }

      // Update current index to start from this successful key next time
      currentKeyIndex = keyIndex;
      return data;
    } catch (err) {
      console.error(`Error with API key index ${keyIndex}:`, err);
      lastError = err;
      // If result is not found or invalid UID, don't retry other keys
      if (err instanceof Error && (err.message.includes('not found') || err.message.includes('invalid'))) {
        throw err;
      }
    }
  }

  throw lastError || new Error('All API rotation nodes are exhausted or offline.');
}

export async function searchPlayers(keyword: string, server: string = 'BD'): Promise<SearchPlayersResponse> {
  const response = await fetch(`${OLD_BASE_URL}/search-players?keyword=${encodeURIComponent(keyword)}&server=${server}`);
  if (!response.ok) {
    throw new Error('Search failed');
  }
  return response.json();
}
