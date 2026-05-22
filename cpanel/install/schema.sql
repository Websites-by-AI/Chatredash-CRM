-- ─── طرح دیتابیس رتبه برتر + ترنم مهر ────────────────────────────────────────
-- نسخه: 1.0 | utf8mb4

SET NAMES utf8mb4;
SET foreign_key_checks = 0;

-- ─── جدول کاربران ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `users` (
  `id`         VARCHAR(36)  NOT NULL PRIMARY KEY,
  `phone`      VARCHAR(20)  NOT NULL UNIQUE,
  `name`       VARCHAR(100) NOT NULL DEFAULT '',
  `role`       ENUM('admin','referrer','registrant') NOT NULL DEFAULT 'registrant',
  `created_at` DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_phone (`phone`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ─── جدول کدهای OTP ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `otps` (
  `phone`      VARCHAR(20)  NOT NULL PRIMARY KEY,
  `code`       VARCHAR(10)  NOT NULL,
  `expires_at` DATETIME     NOT NULL,
  `created_at` DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ─── جدول معرف‌ها ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `referrers` (
  `id`                VARCHAR(36)   NOT NULL PRIMARY KEY,
  `user_id`           VARCHAR(36)   NOT NULL UNIQUE,
  `phone`             VARCHAR(20)   NOT NULL,
  `name`              VARCHAR(100)  NOT NULL DEFAULT '',
  `referral_code`     VARCHAR(20)   NOT NULL UNIQUE,
  `security_pin`      VARCHAR(10)   NOT NULL DEFAULT '',
  `commission_pct`    DECIMAL(5,2)  NOT NULL DEFAULT 20.00,
  `status`            ENUM('active','inactive') NOT NULL DEFAULT 'active',
  `total_earnings`    DECIMAL(15,2) NOT NULL DEFAULT 0,
  `available_balance` DECIMAL(15,2) NOT NULL DEFAULT 0,
  `total_signups`     INT           NOT NULL DEFAULT 0,
  `iban`              VARCHAR(30)   NOT NULL DEFAULT '',
  `created_at`        DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_referral_code (`referral_code`),
  INDEX idx_user_id (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ─── جدول ثبت‌نام‌ها ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `registrations` (
  `id`                VARCHAR(36)   NOT NULL PRIMARY KEY,
  `name`              VARCHAR(100)  NOT NULL,
  `phone`             VARCHAR(20)   NOT NULL,
  `field`             VARCHAR(50)   NOT NULL DEFAULT '',
  `exam`              VARCHAR(100)  NOT NULL DEFAULT '',
  `rank`              VARCHAR(50)   NOT NULL DEFAULT '',
  `referrer_code`     VARCHAR(20)            DEFAULT NULL,
  `referrer_id`       VARCHAR(36)            DEFAULT NULL,
  `discount_pct`      DECIMAL(5,2)  NOT NULL DEFAULT 0,
  `discount_amount`   DECIMAL(15,2) NOT NULL DEFAULT 0,
  `base_price`        DECIMAL(15,2) NOT NULL DEFAULT 0,
  `paid_amount`       DECIMAL(15,2) NOT NULL DEFAULT 0,
  `commission_pct`    DECIMAL(5,2)  NOT NULL DEFAULT 0,
  `commission_amount` DECIMAL(15,2) NOT NULL DEFAULT 0,
  `status`            ENUM('pending','paid','rejected') NOT NULL DEFAULT 'pending',
  `created_at`        DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_referrer_id (`referrer_id`),
  INDEX idx_status (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ─── جدول درخواست‌های تسویه ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `payouts` (
  `id`            VARCHAR(36)   NOT NULL PRIMARY KEY,
  `referrer_id`   VARCHAR(36)   NOT NULL,
  `referrer_name` VARCHAR(100)  NOT NULL DEFAULT '',
  `amount`        DECIMAL(15,2) NOT NULL,
  `iban`          VARCHAR(30)   NOT NULL DEFAULT '',
  `status`        ENUM('pending','approved','paid','rejected') NOT NULL DEFAULT 'pending',
  `created_at`    DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `processed_at`  DATETIME               DEFAULT NULL,
  INDEX idx_referrer_id (`referrer_id`),
  INDEX idx_status (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ─── جدول تنظیمات برنامه ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `app_settings` (
  `setting_key`   VARCHAR(100) NOT NULL PRIMARY KEY,
  `setting_value` TEXT                  DEFAULT NULL,
  `updated_at`    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ─── داده‌های اولیه ───────────────────────────────────────────────────────────
INSERT IGNORE INTO `app_settings` (`setting_key`, `setting_value`) VALUES
('base_price',             '1000000'),
('default_commission_pct', '20'),
('default_discount_pct',   '10'),
('openai_api_key',         ''),
('gemini_api_key',         '');

SET foreign_key_checks = 1;
