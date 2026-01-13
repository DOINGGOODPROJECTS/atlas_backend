SET FOREIGN_KEY_CHECKS = 0;
DELETE FROM ChatMessage;
DELETE FROM ChatSession;
DELETE FROM CityHighlight;
DELETE FROM CityIncentive;
DELETE FROM CityIndustry;
DELETE FROM ComparisonCity;
DELETE FROM Comparison;
DELETE FROM FavoriteCity;
DELETE FROM Notification;
DELETE FROM Report;
DELETE FROM SavedSearch;
DELETE FROM Session;
DELETE FROM UserProfile;
DELETE FROM `Grant`;
DELETE FROM City;
DELETE FROM User;
SET FOREIGN_KEY_CHECKS = 1;

-- Insert City
INSERT INTO City (slug, name, state, region, population, medianIncome, costIndex, businessScore, blackPopulationPct, opportunityScore, networkStrength, housingIndex, climate, createdAt, updatedAt)
VALUES
  ('atlanta-ga', 'Atlanta', 'GA', 'SOUTH', 498000, 71000, 98, 86, 47, 88, 90, 95, 'Humid subtropical', NOW(), NOW()),
  ('houston-tx', 'Houston', 'TX', 'SOUTH', 2300000, 61000, 92, 82, 23, 84, 78, 88, 'Hot humid', NOW(), NOW()),
  ('detroit-mi', 'Detroit', 'MI', 'MIDWEST', 630000, 40000, 84, 72, 77, 78, 82, 68, 'Cold winters', NOW(), NOW());

-- Insert User
INSERT INTO User (email, name, password, createdAt, updatedAt)
VALUES
  ('founder@adinkraatlas.com', 'Janelle Parker', 'hashed-password', NOW(), NOW());

-- Insert UserProfile
INSERT INTO UserProfile (userId, businessName, stage, industry, relocationWindow, budgetRange, priorities, currentLocation, relocationNotes, responseStyle, language, createdAt, updatedAt)
VALUES
  ((SELECT id FROM User WHERE email='founder@adinkraatlas.com'), 'Atlas Studio', 'EARLY_REVENUE', 'Fintech', '3-6 months', '$50k-$150k', '["Cost","Network","Grants"]', 'New York, NY', 'Seeking strong Black founder ecosystem and funding.', 'Concise', 'en', NOW(), NOW());

-- Insert Session
INSERT INTO Session (userId, token, ipAddress, userAgent, expiresAt, createdAt)
VALUES
  ((SELECT id FROM User WHERE email='founder@adinkraatlas.com'), 'session-token-001', '127.0.0.1', 'seed-script', DATE_ADD(NOW(), INTERVAL 7 DAY), NOW());

-- Insert SavedSearch
INSERT INTO SavedSearch (userId, query, region, sortKey, filters, createdAt)
VALUES
  ((SELECT id FROM User WHERE email='founder@adinkraatlas.com'), 'Affordable fintech hubs', 'SOUTH', 'opportunityScore', '{"maxCostIndex":105}', NOW());

-- Insert FavoriteCity
INSERT INTO FavoriteCity (userId, cityId, createdAt)
VALUES
  ((SELECT id FROM User WHERE email='founder@adinkraatlas.com'), (SELECT id FROM City WHERE slug='atlanta-ga'), NOW());

-- Insert Comparison
INSERT INTO Comparison (userId, title, createdAt, updatedAt)
VALUES
  ((SELECT id FROM User WHERE email='founder@adinkraatlas.com'), 'South expansion shortlist', NOW(), NOW());

-- Insert ComparisonCity
INSERT INTO ComparisonCity (comparisonId, cityId, orderIndex, createdAt)
VALUES
  ((SELECT id FROM Comparison WHERE title='South expansion shortlist'), (SELECT id FROM City WHERE slug='atlanta-ga'), 0, NOW()),
  ((SELECT id FROM Comparison WHERE title='South expansion shortlist'), (SELECT id FROM City WHERE slug='houston-tx'), 1, NOW());

-- Insert ChatSession
INSERT INTO ChatSession (userId, title, createdAt, updatedAt)
VALUES
  ((SELECT id FROM User WHERE email='founder@adinkraatlas.com'), 'Funding options', NOW(), NOW());

-- Insert ChatMessage
INSERT INTO ChatMessage (sessionId, role, content, metadata, createdAt)
VALUES
  ((SELECT id FROM ChatSession WHERE title='Funding options'), 'USER', 'Compare grants for Atlanta and Houston.', NULL, NOW()),
  ((SELECT id FROM ChatSession WHERE title='Funding options'), 'ASSISTANT', 'Atlanta shows stronger local grant programs, while Houston offers tax benefits.', NULL, NOW());

-- Insert Notification
INSERT INTO Notification (userId, title, category, createdAt)
VALUES
  ((SELECT id FROM User WHERE email='founder@adinkraatlas.com'), 'New grant match: ATL Business Boost', 'GRANTS', NOW()),
  ((SELECT id FROM User WHERE email='founder@adinkraatlas.com'), 'Atlanta cost index updated', 'CITY_DATA', NOW());

-- Insert Report
INSERT INTO Report (userId, type, status, url, payload, createdAt, updatedAt)
VALUES
  ((SELECT id FROM User WHERE email='founder@adinkraatlas.com'), 'COMPARISON', 'READY', 'https://cdn.adinkraatlas.com/reports/atlanta-vs-houston.pdf', '{"cities":["Atlanta","Houston"],"score":87}', NOW(), NOW());

-- Insert CityHighlight
INSERT INTO CityHighlight (cityId, text, `order`)
VALUES
  ((SELECT id FROM City WHERE slug='atlanta-ga'), 'Global fintech & logistics hub', 0),
  ((SELECT id FROM City WHERE slug='atlanta-ga'), 'Top Black entrepreneur network', 1),
  ((SELECT id FROM City WHERE slug='atlanta-ga'), 'Strong airport connectivity', 2);

-- Insert CityIndustry
INSERT INTO CityIndustry (cityId, name)
VALUES
  ((SELECT id FROM City WHERE slug='atlanta-ga'), 'Fintech'),
  ((SELECT id FROM City WHERE slug='atlanta-ga'), 'Logistics'),
  ((SELECT id FROM City WHERE slug='atlanta-ga'), 'Media');

-- Insert CityIncentive
INSERT INTO CityIncentive (cityId, title, description, url)
VALUES
  ((SELECT id FROM City WHERE slug='atlanta-ga'), 'Invest Atlanta Grants', 'Local grants and mentorship for growth-stage founders.', 'https://investatlanta.com');

-- Insert Grant
INSERT INTO `Grant` (name, deadline, amount, cityId, createdAt, updatedAt)
VALUES
  ('ATL Business Boost', '2026-10-18', '$25K', (SELECT id FROM City WHERE slug='atlanta-ga'), NOW(), NOW()),
  ('Houston Forge', '2026-09-30', '$30K', (SELECT id FROM City WHERE slug='houston-tx'), NOW(), NOW()),
  ('Motor City Match', '2026-10-05', '$50K', (SELECT id FROM City WHERE slug='detroit-mi'), NOW(), NOW());
