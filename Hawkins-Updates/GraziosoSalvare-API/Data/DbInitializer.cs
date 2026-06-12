using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;

namespace GraziosoSalvare.Data
{
    public static class DbInitializer
    {
        public static void Initialize(GSDbContext context)
        {
            context.Database.EnsureCreated();

            if (context.Animals.Any())
            {
                Console.WriteLine("Database already contains animal records. Seeding skipped.");
                return;
            }

            var pathCandidates = new[]
            {
                "/app/aac_shelter_outcomes.csv",
                "aac_shelter_outcomes.csv",
                "../aac_shelter_outcomes.csv",
                "../../aac_shelter_outcomes.csv"
            };

            string? filePath = pathCandidates.FirstOrDefault(File.Exists);
            if (filePath == null)
            {
                Console.WriteLine("CRITICAL: aac_shelter_outcomes.csv was not found in any standard location. Skipping database seed.");
                return;
            }

            Console.WriteLine($"Starting database seed from: {filePath}");
            var batch = new List<Animal>(100);
            int totalInserted = 0;

            try
            {
                using (var reader = new StreamReader(filePath))
                {
                    // Skip header line
                    string? headerLine = reader.ReadLine();
                    if (headerLine == null) return;

                    string? line;
                    while ((line = reader.ReadLine()) != null)
                    {
                        if (string.IsNullOrWhiteSpace(line)) continue;

                        var fields = ParseCsvLine(line);
                        if (fields.Count < 16) continue;

                        var animal = new Animal
                        {
                            Id = ParseInt(fields[0]),
                            AgeUponOutcome = fields[1],
                            AnimalId = fields[2],
                            AnimalType = fields[3],
                            Breed = fields[4],
                            Color = fields[5],
                            DateOfBirth = ParseDateTime(fields[6]),
                            DateTime = ParseDateTime(fields[7]),
                            MonthYear = fields[8],
                            Name = string.IsNullOrWhiteSpace(fields[9]) ? null : fields[9],
                            OutcomeSubtype = string.IsNullOrWhiteSpace(fields[10]) ? null : fields[10],
                            OutcomeType = string.IsNullOrWhiteSpace(fields[11]) ? null : fields[11],
                            SexUponOutcome = fields[12],
                            LocationLat = ParseDouble(fields[13]),
                            LocationLong = ParseDouble(fields[14]),
                            AgeUponOutcomeInWeeks = ParseDouble(fields[15])
                        };

                        batch.Add(animal);

                        // Save in batches of 100 to optimize memory and maintain high transaction speed
                        if (batch.Count == 100)
                        {
                            context.Animals.AddRange(batch);
                            context.SaveChanges();
                            context.ChangeTracker.Clear(); // Flush tracked entities to free memory
                            totalInserted += batch.Count;
                            batch.Clear();
                        }
                    }
                }

                // Insert any remaining records in the final batch
                if (batch.Count > 0)
                {
                    context.Animals.AddRange(batch);
                    context.SaveChanges();
                    context.ChangeTracker.Clear();
                    totalInserted += batch.Count;
                    batch.Clear();
                }

                Console.WriteLine($"Database seeding completed successfully. Total records inserted: {totalInserted}");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"ERROR: An error occurred during database seeding after inserting {totalInserted} records: {ex.Message}");
                Console.WriteLine(ex.StackTrace);
                throw;
            }
        }

        private static List<string> ParseCsvLine(string line)
        {
            var fields = new List<string>();
            var currentField = new System.Text.StringBuilder();
            bool inQuotes = false;

            for (int i = 0; i < line.Length; i++)
            {
                char c = line[i];
                if (c == '"')
                {
                    inQuotes = !inQuotes;
                }
                else if (c == ',' && !inQuotes)
                {
                    fields.Add(currentField.ToString().Trim('"'));
                    currentField.Clear();
                }
                else
                {
                    currentField.Append(c);
                }
            }
            fields.Add(currentField.ToString().Trim('"'));
            return fields;
        }

        private static double ParseDouble(string val)
        {
            return double.TryParse(val, out double res) ? res : 0.0;
        }

        private static int ParseInt(string val)
        {
            return int.TryParse(val, out int res) ? res : 0;
        }

        private static DateTime? ParseDateTime(string val)
        {
            if (DateTime.TryParse(val, out DateTime res))
            {
                return DateTime.SpecifyKind(res, DateTimeKind.Utc);
            }
            return null;
        }
    }
}
