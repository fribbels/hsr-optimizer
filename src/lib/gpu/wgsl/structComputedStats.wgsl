// Don't change this without updating the variable order mapping

struct ComputedStats {
  HP_P: f32,
  ATK_P: f32,
  DEF_P: f32,
  SPD_P: f32,
  HP: f32,
  ATK: f32,
  DEF: f32,
  SPD: f32,
  CR: f32,
  CD: f32,
  EHR: f32,
  RES: f32,
  BE: f32,
  ERR: f32,
  OHB: f32,

  Physical_DMG: f32,
  Fire_DMG: f32,
  Ice_DMG: f32,
  Lightning_DMG: f32,
  Wind_DMG: f32,
  Quantum_DMG: f32,
  Imaginary_DMG: f32,

  ELEMENTAL_DMG: f32,

  BASE_HP: f32,
  BASE_ATK: f32,
  BASE_DEF: f32,
  BASE_SPD: f32,

  BASIC_SCALING: f32,
  SKILL_SCALING: f32,
  ULT_SCALING: f32,
  FUA_SCALING: f32,
  DOT_SCALING: f32,

  BASIC_CR_BOOST: f32,
  SKILL_CR_BOOST: f32,
  ULT_CR_BOOST: f32,
  FUA_CR_BOOST: f32,

  BASIC_CD_BOOST: f32,
  SKILL_CD_BOOST: f32,
  ULT_CD_BOOST: f32,
  FUA_CD_BOOST: f32,

  BASIC_BOOST: f32,
  SKILL_BOOST: f32,
  ULT_BOOST: f32,
  FUA_BOOST: f32,
  DOT_BOOST: f32,
  BREAK_BOOST: f32,
  ADDITIONAL_BOOST: f32,

  VULNERABILITY: f32,
  BASIC_VULNERABILITY: f32,
  SKILL_VULNERABILITY: f32,
  ULT_VULNERABILITY: f32,
  FUA_VULNERABILITY: f32,
  DOT_VULNERABILITY: f32,
  BREAK_VULNERABILITY: f32, // 47

  DEF_PEN: f32,
  BASIC_DEF_PEN: f32,
  SKILL_DEF_PEN: f32,
  ULT_DEF_PEN: f32,
  FUA_DEF_PEN: f32,
  DOT_DEF_PEN: f32,
  BREAK_DEF_PEN: f32,
  SUPER_BREAK_DEF_PEN: f32, // 55

  RES_PEN: f32,
  PHYSICAL_RES_PEN: f32,
  FIRE_RES_PEN: f32,
  ICE_RES_PEN: f32,
  LIGHTNING_RES_PEN: f32,
  WIND_RES_PEN: f32,
  QUANTUM_RES_PEN: f32,
  IMAGINARY_RES_PEN: f32, // 63

  BASIC_RES_PEN: f32,
  SKILL_RES_PEN: f32,
  ULT_RES_PEN: f32,
  FUA_RES_PEN: f32,
  DOT_RES_PEN: f32, // 68

  BASIC_DMG: f32,
  SKILL_DMG: f32,
  ULT_DMG: f32,
  FUA_DMG: f32,
  DOT_DMG: f32,
  BREAK_DMG: f32,
  COMBO_DMG: f32, // 75

  DMG_RED_MULTI: f32,
  EHP: f32,
  SHIELD_BOOST: f32,

  DOT_CHANCE: f32,
  EFFECT_RES_PEN: f32,

  DOT_SPLIT: f32,
  DOT_STACKS: f32,

  SUMMONS: f32,

  ENEMY_WEAKNESS_BROKEN: f32,

  SUPER_BREAK_MODIFIER: f32,
  BASIC_SUPER_BREAK_MODIFIER: f32,
  BASIC_TOUGHNESS_DMG: f32,
  SKILL_TOUGHNESS_DMG: f32,
  ULT_TOUGHNESS_DMG: f32,
  FUA_TOUGHNESS_DMG: f32,
  MEMO_SKILL_TOUGHNESS_DMG: f32,

  TRUE_DMG_MODIFIER: f32,
  BASIC_TRUE_DMG_MODIFIER: f32,
  SKILL_TRUE_DMG_MODIFIER: f32,
  ULT_TRUE_DMG_MODIFIER: f32,
  FUA_TRUE_DMG_MODIFIER: f32,
  BREAK_TRUE_DMG_MODIFIER: f32,

  BASIC_FINAL_DMG_BOOST: f32,
  SKILL_FINAL_DMG_BOOST: f32,
  ULT_FINAL_DMG_BOOST: f32,

  BASIC_BREAK_DMG_MODIFIER: f32,

  ULT_ADDITIONAL_DMG_CR_OVERRIDE: f32,
  ULT_ADDITIONAL_DMG_CD_OVERRIDE: f32,

  SKILL_OHB: f32,
  ULT_OHB: f32,
  HEAL_TYPE: f32,
  HEAL_FLAT: f32,
  HEAL_SCALING: f32,
  HEAL_VALUE: f32,
  SHIELD_FLAT: f32,
  SHIELD_SCALING: f32,
  SHIELD_VALUE: f32,

  BASIC_ADDITIONAL_DMG_SCALING: f32,
  SKILL_ADDITIONAL_DMG_SCALING: f32,
  ULT_ADDITIONAL_DMG_SCALING: f32,
  FUA_ADDITIONAL_DMG_SCALING: f32,

  BASIC_ADDITIONAL_DMG: f32,
  SKILL_ADDITIONAL_DMG: f32,
  ULT_ADDITIONAL_DMG: f32,
  FUA_ADDITIONAL_DMG: f32,

  MEMO_BUFF_PRIORITY: f32,
  DEPRIORITIZE_BUFFS: f32,

  MEMO_BASE_HP_SCALING: f32,
  MEMO_BASE_HP_FLAT: f32,
  MEMO_BASE_DEF_SCALING: f32,
  MEMO_BASE_DEF_FLAT: f32,
  MEMO_BASE_ATK_SCALING: f32,
  MEMO_BASE_ATK_FLAT: f32,
  MEMO_BASE_SPD_SCALING: f32,
  MEMO_BASE_SPD_FLAT: f32,

  MEMO_SKILL_SCALING: f32,
  MEMO_TALENT_SCALING: f32,

  MEMO_SKILL_DMG: f32,
  MEMO_TALENT_DMG: f32,

  UNCONVERTIBLE_HP_BUFF: f32,
  UNCONVERTIBLE_ATK_BUFF: f32,
  UNCONVERTIBLE_DEF_BUFF: f32,
  UNCONVERTIBLE_SPD_BUFF: f32,
  UNCONVERTIBLE_CR_BUFF: f32,
  UNCONVERTIBLE_CD_BUFF: f32,
  UNCONVERTIBLE_EHR_BUFF: f32,
  UNCONVERTIBLE_BE_BUFF: f32,
  UNCONVERTIBLE_OHB_BUFF: f32,
  UNCONVERTIBLE_RES_BUFF: f32,
  UNCONVERTIBLE_ERR_BUFF: f32,

  BREAK_EFFICIENCY_BOOST: f32,
  BASIC_BREAK_EFFICIENCY_BOOST: f32,
  ULT_BREAK_EFFICIENCY_BOOST: f32,

  BASIC_DMG_TYPE: f32,
  SKILL_DMG_TYPE: f32,
  ULT_DMG_TYPE: f32,
  FUA_DMG_TYPE: f32,
  DOT_DMG_TYPE: f32,
  BREAK_DMG_TYPE: f32,
  SUPER_BREAK_DMG_TYPE: f32,
  MEMO_DMG_TYPE: f32,
  ADDITIONAL_DMG_TYPE: f32,
TEST_VALUE_1: f32,
TEST_VALUE_2: f32,
TEST_VALUE_3: f32,
TEST_VALUE_4: f32,
TEST_VALUE_5: f32,
TEST_VALUE_6: f32,
TEST_VALUE_7: f32,
TEST_VALUE_8: f32,
TEST_VALUE_9: f32,
TEST_VALUE_10: f32,
TEST_VALUE_11: f32,
TEST_VALUE_12: f32,
TEST_VALUE_13: f32,
TEST_VALUE_14: f32,
TEST_VALUE_15: f32,
TEST_VALUE_16: f32,
TEST_VALUE_17: f32,
TEST_VALUE_18: f32,
TEST_VALUE_19: f32,
TEST_VALUE_20: f32,
TEST_VALUE_21: f32,
TEST_VALUE_22: f32,
TEST_VALUE_23: f32,
TEST_VALUE_24: f32,
TEST_VALUE_25: f32,
TEST_VALUE_26: f32,
TEST_VALUE_27: f32,
TEST_VALUE_28: f32,
TEST_VALUE_29: f32,
TEST_VALUE_30: f32,
TEST_VALUE_31: f32,
TEST_VALUE_32: f32,
TEST_VALUE_33: f32,
TEST_VALUE_34: f32,
TEST_VALUE_35: f32,
TEST_VALUE_36: f32,
TEST_VALUE_37: f32,
TEST_VALUE_38: f32,
TEST_VALUE_39: f32,
TEST_VALUE_40: f32,
TEST_VALUE_41: f32,
TEST_VALUE_42: f32,
TEST_VALUE_43: f32,
TEST_VALUE_44: f32,
TEST_VALUE_45: f32,
TEST_VALUE_46: f32,
TEST_VALUE_47: f32,
TEST_VALUE_48: f32,
TEST_VALUE_49: f32,
TEST_VALUE_50: f32,
TEST_VALUE_51: f32,
TEST_VALUE_52: f32,
TEST_VALUE_53: f32,
TEST_VALUE_54: f32,
TEST_VALUE_55: f32,
TEST_VALUE_56: f32,
TEST_VALUE_57: f32,
TEST_VALUE_58: f32,
TEST_VALUE_59: f32,
TEST_VALUE_60: f32,
TEST_VALUE_61: f32,
TEST_VALUE_62: f32,
TEST_VALUE_63: f32,
TEST_VALUE_64: f32,
TEST_VALUE_65: f32,
TEST_VALUE_66: f32,
TEST_VALUE_67: f32,
TEST_VALUE_68: f32,
TEST_VALUE_69: f32,
TEST_VALUE_70: f32,
TEST_VALUE_71: f32,
TEST_VALUE_72: f32,
TEST_VALUE_73: f32,
TEST_VALUE_74: f32,
TEST_VALUE_75: f32,
TEST_VALUE_76: f32,
TEST_VALUE_77: f32,
TEST_VALUE_78: f32,
TEST_VALUE_79: f32,
TEST_VALUE_80: f32,
TEST_VALUE_81: f32,
TEST_VALUE_82: f32,
TEST_VALUE_83: f32,
TEST_VALUE_84: f32,
TEST_VALUE_85: f32,
TEST_VALUE_86: f32,
TEST_VALUE_87: f32,
TEST_VALUE_88: f32,
TEST_VALUE_89: f32,
TEST_VALUE_90: f32,
TEST_VALUE_91: f32,
TEST_VALUE_92: f32,
TEST_VALUE_93: f32,
TEST_VALUE_94: f32,
TEST_VALUE_95: f32,
TEST_VALUE_96: f32,
TEST_VALUE_97: f32,
TEST_VALUE_98: f32,
TEST_VALUE_99: f32,
TEST_VALUE_100: f32,
TEST_VALUE_101: f32,
TEST_VALUE_102: f32,
TEST_VALUE_103: f32,
TEST_VALUE_104: f32,
TEST_VALUE_105: f32,
TEST_VALUE_106: f32,
TEST_VALUE_107: f32,
TEST_VALUE_108: f32,
TEST_VALUE_109: f32,
TEST_VALUE_110: f32,
TEST_VALUE_111: f32,
TEST_VALUE_112: f32,
TEST_VALUE_113: f32,
TEST_VALUE_114: f32,
TEST_VALUE_115: f32,
TEST_VALUE_116: f32,
TEST_VALUE_117: f32,
TEST_VALUE_118: f32,
TEST_VALUE_119: f32,
TEST_VALUE_120: f32,
TEST_VALUE_121: f32,
TEST_VALUE_122: f32,
TEST_VALUE_123: f32,
TEST_VALUE_124: f32,
TEST_VALUE_125: f32,
TEST_VALUE_126: f32,
TEST_VALUE_127: f32,
TEST_VALUE_128: f32,
TEST_VALUE_129: f32,
TEST_VALUE_130: f32,
TEST_VALUE_131: f32,
TEST_VALUE_132: f32,
TEST_VALUE_133: f32,
TEST_VALUE_134: f32,
TEST_VALUE_135: f32,
TEST_VALUE_136: f32,
TEST_VALUE_137: f32,
TEST_VALUE_138: f32,
TEST_VALUE_139: f32,
TEST_VALUE_140: f32,
TEST_VALUE_141: f32,
TEST_VALUE_142: f32,
TEST_VALUE_143: f32,
TEST_VALUE_144: f32,
TEST_VALUE_145: f32,
TEST_VALUE_146: f32,
TEST_VALUE_147: f32,
TEST_VALUE_148: f32,
TEST_VALUE_149: f32,
TEST_VALUE_150: f32,
TEST_VALUE_151: f32,
TEST_VALUE_152: f32,
TEST_VALUE_153: f32,
TEST_VALUE_154: f32,
TEST_VALUE_155: f32,
TEST_VALUE_156: f32,
TEST_VALUE_157: f32,
TEST_VALUE_158: f32,
TEST_VALUE_159: f32,
TEST_VALUE_160: f32,
TEST_VALUE_161: f32,
TEST_VALUE_162: f32,
TEST_VALUE_163: f32,
TEST_VALUE_164: f32,
TEST_VALUE_165: f32,
TEST_VALUE_166: f32,
TEST_VALUE_167: f32,
TEST_VALUE_168: f32,
TEST_VALUE_169: f32,
TEST_VALUE_170: f32,
TEST_VALUE_171: f32,
TEST_VALUE_172: f32,
TEST_VALUE_173: f32,
TEST_VALUE_174: f32,
TEST_VALUE_175: f32,
TEST_VALUE_176: f32,
TEST_VALUE_177: f32,
TEST_VALUE_178: f32,
TEST_VALUE_179: f32,
TEST_VALUE_180: f32,
TEST_VALUE_181: f32,
TEST_VALUE_182: f32,
TEST_VALUE_183: f32,
TEST_VALUE_184: f32,
TEST_VALUE_185: f32,
TEST_VALUE_186: f32,
TEST_VALUE_187: f32,
TEST_VALUE_188: f32,
TEST_VALUE_189: f32,
TEST_VALUE_190: f32,
TEST_VALUE_191: f32,
TEST_VALUE_192: f32,
TEST_VALUE_193: f32,
TEST_VALUE_194: f32,
TEST_VALUE_195: f32,
TEST_VALUE_196: f32,
TEST_VALUE_197: f32,
TEST_VALUE_198: f32,
TEST_VALUE_199: f32,
TEST_VALUE_200: f32,
TEST_VALUE_201: f32,
TEST_VALUE_202: f32,
TEST_VALUE_203: f32,
TEST_VALUE_204: f32,
TEST_VALUE_205: f32,
TEST_VALUE_206: f32,
TEST_VALUE_207: f32,
TEST_VALUE_208: f32,
TEST_VALUE_209: f32,
TEST_VALUE_210: f32,
TEST_VALUE_211: f32,
TEST_VALUE_212: f32,
TEST_VALUE_213: f32,
TEST_VALUE_214: f32,
TEST_VALUE_215: f32,
TEST_VALUE_216: f32,
TEST_VALUE_217: f32,
TEST_VALUE_218: f32,
TEST_VALUE_219: f32,
TEST_VALUE_220: f32,
TEST_VALUE_221: f32,
TEST_VALUE_222: f32,
TEST_VALUE_223: f32,
TEST_VALUE_224: f32,
TEST_VALUE_225: f32,
TEST_VALUE_226: f32,
TEST_VALUE_227: f32,
TEST_VALUE_228: f32,
TEST_VALUE_229: f32,
TEST_VALUE_230: f32,
TEST_VALUE_231: f32,
TEST_VALUE_232: f32,
TEST_VALUE_233: f32,
TEST_VALUE_234: f32,
TEST_VALUE_235: f32,
TEST_VALUE_236: f32,
TEST_VALUE_237: f32,
TEST_VALUE_238: f32,
TEST_VALUE_239: f32,
TEST_VALUE_240: f32,
TEST_VALUE_241: f32,
TEST_VALUE_242: f32,
TEST_VALUE_243: f32,
TEST_VALUE_244: f32,
TEST_VALUE_245: f32,
TEST_VALUE_246: f32,
TEST_VALUE_247: f32,
TEST_VALUE_248: f32,
TEST_VALUE_249: f32,
TEST_VALUE_250: f32,
TEST_VALUE_251: f32,
TEST_VALUE_252: f32,
TEST_VALUE_253: f32,
TEST_VALUE_254: f32,
TEST_VALUE_255: f32,
TEST_VALUE_256: f32,
TEST_VALUE_257: f32,
TEST_VALUE_258: f32,
TEST_VALUE_259: f32,
TEST_VALUE_260: f32,
TEST_VALUE_261: f32,
TEST_VALUE_262: f32,
TEST_VALUE_263: f32,
TEST_VALUE_264: f32,
TEST_VALUE_265: f32,
TEST_VALUE_266: f32,
TEST_VALUE_267: f32,
TEST_VALUE_268: f32,
TEST_VALUE_269: f32,
TEST_VALUE_270: f32,
TEST_VALUE_271: f32,
TEST_VALUE_272: f32,
TEST_VALUE_273: f32,
TEST_VALUE_274: f32,
TEST_VALUE_275: f32,
TEST_VALUE_276: f32,
TEST_VALUE_277: f32,
TEST_VALUE_278: f32,
TEST_VALUE_279: f32,
TEST_VALUE_280: f32,
TEST_VALUE_281: f32,
TEST_VALUE_282: f32,
TEST_VALUE_283: f32,
TEST_VALUE_284: f32,
TEST_VALUE_285: f32,
TEST_VALUE_286: f32,
TEST_VALUE_287: f32,
TEST_VALUE_288: f32,
TEST_VALUE_289: f32,
TEST_VALUE_290: f32,
TEST_VALUE_291: f32,
TEST_VALUE_292: f32,
TEST_VALUE_293: f32,
TEST_VALUE_294: f32,
TEST_VALUE_295: f32,
TEST_VALUE_296: f32,
TEST_VALUE_297: f32,
TEST_VALUE_298: f32,
TEST_VALUE_299: f32,
TEST_VALUE_300: f32,
TEST_VALUE_301: f32,
TEST_VALUE_302: f32,
TEST_VALUE_303: f32,
TEST_VALUE_304: f32,
TEST_VALUE_305: f32,
TEST_VALUE_306: f32,
TEST_VALUE_307: f32,
TEST_VALUE_308: f32,
TEST_VALUE_309: f32,
TEST_VALUE_310: f32,
TEST_VALUE_311: f32,
TEST_VALUE_312: f32,
TEST_VALUE_313: f32,
TEST_VALUE_314: f32,
TEST_VALUE_315: f32,
TEST_VALUE_316: f32,
TEST_VALUE_317: f32,
TEST_VALUE_318: f32,
TEST_VALUE_319: f32,
TEST_VALUE_320: f32,
TEST_VALUE_321: f32,
TEST_VALUE_322: f32,
TEST_VALUE_323: f32,
TEST_VALUE_324: f32,
TEST_VALUE_325: f32,
TEST_VALUE_326: f32,
TEST_VALUE_327: f32,
TEST_VALUE_328: f32,
TEST_VALUE_329: f32,
TEST_VALUE_330: f32,
TEST_VALUE_331: f32,
TEST_VALUE_332: f32,
TEST_VALUE_333: f32,
TEST_VALUE_334: f32,
TEST_VALUE_335: f32,
TEST_VALUE_336: f32,
TEST_VALUE_337: f32,
TEST_VALUE_338: f32,
TEST_VALUE_339: f32,
TEST_VALUE_340: f32,
TEST_VALUE_341: f32,
TEST_VALUE_342: f32,
TEST_VALUE_343: f32,
TEST_VALUE_344: f32,
TEST_VALUE_345: f32,
TEST_VALUE_346: f32,
TEST_VALUE_347: f32,
TEST_VALUE_348: f32,
TEST_VALUE_349: f32,
TEST_VALUE_350: f32,
TEST_VALUE_351: f32,
TEST_VALUE_352: f32,
TEST_VALUE_353: f32,
TEST_VALUE_354: f32,
TEST_VALUE_355: f32,
TEST_VALUE_356: f32,
TEST_VALUE_357: f32,
TEST_VALUE_358: f32,
TEST_VALUE_359: f32,
TEST_VALUE_360: f32,
TEST_VALUE_361: f32,
TEST_VALUE_362: f32,
TEST_VALUE_363: f32,
TEST_VALUE_364: f32,
TEST_VALUE_365: f32,
TEST_VALUE_366: f32,
TEST_VALUE_367: f32,
TEST_VALUE_368: f32,
TEST_VALUE_369: f32,
TEST_VALUE_370: f32,
TEST_VALUE_371: f32,
TEST_VALUE_372: f32,
TEST_VALUE_373: f32,
TEST_VALUE_374: f32,
TEST_VALUE_375: f32,
TEST_VALUE_376: f32,
TEST_VALUE_377: f32,
TEST_VALUE_378: f32,
TEST_VALUE_379: f32,
TEST_VALUE_380: f32,
TEST_VALUE_381: f32,
TEST_VALUE_382: f32,
TEST_VALUE_383: f32,
TEST_VALUE_384: f32,
TEST_VALUE_385: f32,
TEST_VALUE_386: f32,
TEST_VALUE_387: f32,
TEST_VALUE_388: f32,
TEST_VALUE_389: f32,
TEST_VALUE_390: f32,
TEST_VALUE_391: f32,
TEST_VALUE_392: f32,
TEST_VALUE_393: f32,
TEST_VALUE_394: f32,
TEST_VALUE_395: f32,
TEST_VALUE_396: f32,
TEST_VALUE_397: f32,
TEST_VALUE_398: f32,
TEST_VALUE_399: f32,
TEST_VALUE_400: f32,
TEST_VALUE_401: f32,
TEST_VALUE_402: f32,
TEST_VALUE_403: f32,
TEST_VALUE_404: f32,
TEST_VALUE_405: f32,
TEST_VALUE_406: f32,
TEST_VALUE_407: f32,
TEST_VALUE_408: f32,
TEST_VALUE_409: f32,
TEST_VALUE_410: f32,
TEST_VALUE_411: f32,
TEST_VALUE_412: f32,
TEST_VALUE_413: f32,
TEST_VALUE_414: f32,
TEST_VALUE_415: f32,
TEST_VALUE_416: f32,
TEST_VALUE_417: f32,
TEST_VALUE_418: f32,
TEST_VALUE_419: f32,
TEST_VALUE_420: f32,
TEST_VALUE_421: f32,
TEST_VALUE_422: f32,
TEST_VALUE_423: f32,
TEST_VALUE_424: f32,
TEST_VALUE_425: f32,
TEST_VALUE_426: f32,
TEST_VALUE_427: f32,
TEST_VALUE_428: f32,
TEST_VALUE_429: f32,
TEST_VALUE_430: f32,
TEST_VALUE_431: f32,
TEST_VALUE_432: f32,
TEST_VALUE_433: f32,
TEST_VALUE_434: f32,
TEST_VALUE_435: f32,
TEST_VALUE_436: f32,
TEST_VALUE_437: f32,
TEST_VALUE_438: f32,
TEST_VALUE_439: f32,
TEST_VALUE_440: f32,
TEST_VALUE_441: f32,
TEST_VALUE_442: f32,
TEST_VALUE_443: f32,
TEST_VALUE_444: f32,
TEST_VALUE_445: f32,
TEST_VALUE_446: f32,
TEST_VALUE_447: f32,
TEST_VALUE_448: f32,
TEST_VALUE_449: f32,
TEST_VALUE_450: f32,
TEST_VALUE_451: f32,
TEST_VALUE_452: f32,
TEST_VALUE_453: f32,
TEST_VALUE_454: f32,
TEST_VALUE_455: f32,
TEST_VALUE_456: f32,
TEST_VALUE_457: f32,
TEST_VALUE_458: f32,
TEST_VALUE_459: f32,
TEST_VALUE_460: f32,
TEST_VALUE_461: f32,
TEST_VALUE_462: f32,
TEST_VALUE_463: f32,
TEST_VALUE_464: f32,
TEST_VALUE_465: f32,
TEST_VALUE_466: f32,
TEST_VALUE_467: f32,
TEST_VALUE_468: f32,
TEST_VALUE_469: f32,
TEST_VALUE_470: f32,
TEST_VALUE_471: f32,
TEST_VALUE_472: f32,
TEST_VALUE_473: f32,
TEST_VALUE_474: f32,
TEST_VALUE_475: f32,
TEST_VALUE_476: f32,
TEST_VALUE_477: f32,
TEST_VALUE_478: f32,
TEST_VALUE_479: f32,
TEST_VALUE_480: f32,
TEST_VALUE_481: f32,
TEST_VALUE_482: f32,
TEST_VALUE_483: f32,
TEST_VALUE_484: f32,
TEST_VALUE_485: f32,
TEST_VALUE_486: f32,
TEST_VALUE_487: f32,
TEST_VALUE_488: f32,
TEST_VALUE_489: f32,
TEST_VALUE_490: f32,
TEST_VALUE_491: f32,
TEST_VALUE_492: f32,
TEST_VALUE_493: f32,
TEST_VALUE_494: f32,
TEST_VALUE_495: f32,
TEST_VALUE_496: f32,
TEST_VALUE_497: f32,
TEST_VALUE_498: f32,
TEST_VALUE_499: f32,
TEST_VALUE_500: f32,

  sets: Sets,
}
