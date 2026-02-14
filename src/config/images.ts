export interface ChallengeImageSet {
  original: string[];
  attacked: string[];
}

// Image lists for pixel attack challenge
export const PIXEL_ATTACK_IMAGES: ChallengeImageSet = {
  original: [
    '01_idx0_true8_pred8.png',
    '02_idx1_true4_pred4.png',
    '03_idx2_true8_pred8.png',
    '04_idx3_true7_pred7.png',
    '05_idx4_true7_pred7.png',
    '06_idx5_true0_pred0.png',
    '07_idx6_true6_pred6.png',
    '08_idx7_true2_pred2.png',
    '09_idx8_true7_pred7.png',
    '10_idx9_true4_pred4.png',
    '11_idx10_true3_pred3.png',
    '12_idx11_true9_pred9.png',
    'failed_0_true8_pred8.png',
    'failed_1_true4_pred4.png',
    'failed_2_true8_pred8.png',
    'failed_3_true7_pred7.png',
    'failed_4_true7_pred7.png',
  ],
  attacked: [
    'attack_0_attacked_pred9.png',
    'attack_1_attacked_pred2.png',
    'attack_2_attacked_pred6.png',
    'attack_3_attacked_pred9.png',
    'attack_4_attacked_pred7.png',
  ],
};

// Image lists for rotation attack challenge
export const ROTATE_ATTACK_IMAGES: ChallengeImageSet = {
  original: [
    '01_idx0_true8_pred8.png',
    '02_idx1_true4_pred4.png',
    '03_idx2_true8_pred8.png',
    '04_idx3_true7_pred7.png',
    '05_idx4_true7_pred7.png',
    '06_idx5_true0_pred0.png',
    '07_idx6_true6_pred6.png',
    '08_idx7_true2_pred2.png',
    '09_idx8_true7_pred7.png',
    '10_idx9_true4_pred4.png',
    '11_idx10_true3_pred3.png',
    '12_idx11_true9_pred9.png',
  ],
  attacked: [
    'rotate_attack_0_attacked_pred2_rot15deg.png',
    'rotate_attack_1_attacked_pred2_rot15deg.png',
    'rotate_attack_2_attacked_pred2_rot-10deg.png',
    'rotate_attack_3_attacked_pred5_rot15deg.png',
    'rotate_attack_4_attacked_pred2_rot-15deg.png',
  ],
};

// Image lists for shift attack challenge
export const SHIFT_ATTACK_IMAGES: ChallengeImageSet = {
  original: [
    '01_idx0_true8_pred8.png',
    '02_idx1_true4_pred4.png',
    '03_idx2_true8_pred8.png',
    '04_idx3_true7_pred7.png',
    '05_idx4_true7_pred7.png',
    '06_idx5_true0_pred0.png',
    '07_idx6_true6_pred6.png',
    '08_idx7_true2_pred2.png',
    '09_idx8_true7_pred7.png',
    '10_idx9_true4_pred4.png',
    '11_idx10_true3_pred3.png',
    '12_idx11_true9_pred9.png',
  ],
  attacked: [
    'shift_attack_0_attacked_pred2_dx-5_dy-4.png',
    'shift_attack_1_attacked_pred8_dx-5_dy-3.png',
    'shift_attack_2_attacked_pred2_dx-3_dy5.png',
    'shift_attack_3_attacked_pred2_dx-1_dy-3.png',
    'shift_attack_4_attacked_pred2_dx2_dy-5.png',
  ],
};
