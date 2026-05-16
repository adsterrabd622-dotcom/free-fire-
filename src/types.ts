/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface ProAccountInfo {
  AccountAvatarId: number;
  AccountBPBadges: number;
  AccountBPid: number;
  AccountBannerId: number;
  AccountCreateTime: number;
  AccountEXP: number;
  AccountLastLogin: number;
  AccountLevel: number;
  AccountLikes: number;
  AccountName: string;
  AccountRegion: string;
  AccountSeasonId: number;
  AccountType: number;
  BrMaxRank: number;
  BrRankPoint: number;
  CsMaxRank: number;
  CsRankPoint: number;
  EquippedWeapon: number[];
  ReleaseVersion: string;
  ShowBrRank: boolean;
  ShowCsRank: boolean;
}

export interface ProAccountProfileInfo {
  EquippedOutfit: number[];
  EquippedSkills: number[];
}

export interface ProGuildInfo {
  GuildCapacity: number;
  Guildid: string;
  GuildLevel: number;
  GuildMember: number;
  GuildName: string;
  GuildOwner: string;
}

export interface ProCaptainInfo {
  accountId: string;
  nickname: string;
  level: number;
  liked: number;
  maxRank: number;
  rankingPoints: number;
}

export interface ProCreditScoreInfo {
  creditScore: number;
}

export interface ProPetInfo {
  id: number;
  level: number;
  isselected: boolean;
  name?: string;
}

export interface ProSocialInfo {
  AccountLanguage: string;
  AccountPreferMode: string;
  AccountSignature: string;
}

export interface ProApiResponse {
  source: string;
  result: {
    AccountInfo: ProAccountInfo;
    AccountProfileInfo: ProAccountProfileInfo;
    GuildInfo?: ProGuildInfo;
    captainBasicInfo?: ProCaptainInfo;
    creditScoreInfo?: ProCreditScoreInfo;
    petInfo?: ProPetInfo;
    socialinfo?: ProSocialInfo;
  };
  usage: {
    usedToday: number;
    dailyLimit: number;
    remainingToday: number;
  };
}

export interface SearchPlayer {
  nickname: string;
  uid: string;
  server: string;
}

export interface SearchPlayersResponse {
  data: SearchPlayer[];
  success: boolean;
}
