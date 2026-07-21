-- RenameIndex
ALTER TABLE `accounts` RENAME INDEX `unique_bank_account` TO `accounts_bankCode_accountNumber_key`;
