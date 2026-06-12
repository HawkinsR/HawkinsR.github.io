using System;
using System.Linq;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using GraziosoSalvare.Data;

namespace GraziosoSalvare.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AnimalController : ControllerBase
    {
        private readonly GSDbContext _context;
        private readonly ILogger<AnimalController> _logger;
        
        public AnimalController(GSDbContext context, ILogger<AnimalController> logger)
        {
            _context = context;
            _logger = logger;
        }

        [HttpGet]
        [Route("animals")]
        public IActionResult GetAnimals(
            [FromQuery] int page = 1, 
            [FromQuery] int pageSize = 100,
            [FromQuery] string[]? animalType = null,
            [FromQuery] string[]? sexUponOutcome = null,
            [FromQuery] string[]? outcomeType = null,
            [FromQuery] double? minAge = null,
            [FromQuery] double? maxAge = null)
        {
            _logger.LogInformation($"GetAnimals called with page={page}, pageSize={pageSize}");
            if (page < 1) page = 1;
            if (pageSize < 1) pageSize = 100;
            if (pageSize > 500) pageSize = 500; // Protection guard rail

            try
            {
                var query = _context.Animals.AsQueryable();

                if (animalType != null && animalType.Length > 0)
                {
                    query = query.Where(a => animalType.Contains(a.AnimalType));
                }
                
                if (sexUponOutcome != null && sexUponOutcome.Length > 0)
                {
                    query = query.Where(a => sexUponOutcome.Contains(a.SexUponOutcome));
                }

                if (outcomeType != null && outcomeType.Length > 0)
                {
                    query = query.Where(a => outcomeType.Contains(a.OutcomeType));
                }

                if (minAge.HasValue)
                {
                    query = query.Where(a => a.AgeUponOutcomeInWeeks >= minAge.Value);
                }

                if (maxAge.HasValue)
                {
                    query = query.Where(a => a.AgeUponOutcomeInWeeks <= maxAge.Value);
                }
                
                int totalCount = query.Count();
                int totalPages = (int)Math.Ceiling((double)totalCount / pageSize);

                var list = query
                    .OrderBy(a => a.Id)
                    .Skip((page - 1) * pageSize)
                    .Take(pageSize)
                    .ToList();

                _logger.LogInformation($"Successfully fetched {list.Count} animal records for page {page}.");
                
                return Ok(new
                {
                    TotalCount = totalCount,
                    TotalPages = totalPages,
                    CurrentPage = page,
                    PageSize = pageSize,
                    Animals = list
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to retrieve animal list.");
                return StatusCode(500, new { Error = "An error occurred retrieving data.", Message = ex.Message });
            }
        }

        [HttpGet]
        [Route("animals/{id}")]
        public IActionResult GetAnimalById(int id)
        {
            _logger.LogInformation($"Retrieving animal record with ID: {id}");
            var animal = _context.Animals.Find(id);
            if (animal == null)
            {
                _logger.LogWarning($"Animal record with ID {id} not found.");
                return NotFound(new { Message = $"Animal with ID {id} not found." });
            }
            return Ok(animal);
        }

        [HttpGet]
        [Route("animals/filter/{rescueType}")]
        public IActionResult GetFilteredAnimals(string rescueType)
        {
            _logger.LogInformation($"Filtering outcomes by rescue category: {rescueType}");
            
            try
            {
                IQueryable<Animal> query = _context.Animals;
                string normalized = rescueType.ToLowerInvariant();

                if (normalized == "water")
                {
                    var breeds = new[] { "Labrador Retriever Mix", "Chesapeake Bay Retriever", "Newfoundland" };
                    query = query.Where(a => a.AnimalType == "Dog" &&
                                             a.SexUponOutcome == "Intact Female" &&
                                             a.AgeUponOutcomeInWeeks >= 26.0 &&
                                             a.AgeUponOutcomeInWeeks <= 156.0 &&
                                             breeds.Contains(a.Breed));
                }
                else if (normalized == "mountain")
                {
                    var breeds = new[] { "German Shepherd", "Alaskan Malamute", "Old English Sheepdog", "Siberian Husky", "Bloodhound" };
                    query = query.Where(a => a.AnimalType == "Dog" &&
                                             a.SexUponOutcome == "Intact Male" &&
                                             a.AgeUponOutcomeInWeeks >= 26.0 &&
                                             a.AgeUponOutcomeInWeeks <= 156.0 &&
                                             breeds.Contains(a.Breed));
                }
                else if (normalized == "disaster")
                {
                    var breeds = new[] { "Doberman Pinscher", "German Shepherd", "Golden Retriever", "Bloodhound", "Rottweiler" };
                    query = query.Where(a => a.AnimalType == "Dog" &&
                                             a.SexUponOutcome == "Intact Male" &&
                                             a.AgeUponOutcomeInWeeks >= 26.0 &&
                                             a.AgeUponOutcomeInWeeks <= 156.0 &&
                                             breeds.Contains(a.Breed));
                }
                else if (normalized != "all" && normalized != "reset")
                {
                    _logger.LogWarning($"Received invalid rescue filter query: {rescueType}");
                    return BadRequest(new { Error = "Invalid Filter Type", Message = $"Unknown rescue query: {rescueType}" });
                }

                var result = query.ToList();
                _logger.LogInformation($"Filter '{rescueType}' completed. Found {result.Count} matches.");
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Failed to process rescue filter query for: {rescueType}");
                return StatusCode(500, new { Error = "Filter Execution Error", Message = ex.Message });
            }
        }

        [HttpGet]
        [Route("filter-options")]
        public IActionResult GetFilterOptions()
        {
            _logger.LogInformation("Retrieving available filter options from the database.");
            try
            {
                var animalTypes = _context.Animals.Where(a => a.AnimalType != null).Select(a => a.AnimalType).Distinct().OrderBy(a => a).ToList();
                var sexes = _context.Animals.Where(a => a.SexUponOutcome != null).Select(a => a.SexUponOutcome).Distinct().OrderBy(s => s).ToList();
                var outcomes = _context.Animals.Where(a => a.OutcomeType != null).Select(a => a.OutcomeType).Distinct().OrderBy(o => o).ToList();
                var maxAgeInWeeks = _context.Animals.Any() ? _context.Animals.Max(a => a.AgeUponOutcomeInWeeks) : 1000;

                return Ok(new
                {
                    AnimalTypes = animalTypes,
                    Sexes = sexes,
                    Outcomes = outcomes,
                    MaxAgeInWeeks = maxAgeInWeeks
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to retrieve filter options.");
                return StatusCode(500, new { Error = "Database Error", Message = ex.Message });
            }
        }

        [HttpPost]
        [Route("animals")]
        public IActionResult CreateAnimal([FromBody] Animal animal)
        {
            _logger.LogInformation("Creating a new animal record.");
            if (animal == null)
            {
                return BadRequest(new { Error = "Invalid Payload", Message = "Animal data cannot be null." });
            }

            try
            {
                // Let database sequence generate the primary key by resetting ID to 0
                animal.Id = 0;
                
                _context.Animals.Add(animal);
                _context.SaveChanges();
                
                _logger.LogInformation($"Successfully created animal record with ID: {animal.Id}");
                return CreatedAtAction(nameof(GetAnimalById), new { id = animal.Id }, animal);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to create new animal record.");
                return StatusCode(500, new { Error = "Persistence Failure", Message = ex.Message });
            }
        }

        [HttpPut]
        [Route("animals/{id}")]
        public IActionResult UpdateAnimal(int id, [FromBody] Animal updatedAnimal)
        {
            _logger.LogInformation($"Updating animal record with ID: {id}");
            if (updatedAnimal == null || updatedAnimal.Id != id)
            {
                _logger.LogWarning($"Update failed: ID mismatch (Query: {id}, Body: {updatedAnimal?.Id})");
                return BadRequest(new { Error = "Payload Mismatch", Message = "URL identifier and payload ID must match." });
            }

            try
            {
                var existingAnimal = _context.Animals.Find(id);
                if (existingAnimal == null)
                {
                    _logger.LogWarning($"Update failed: Animal record with ID {id} not found.");
                    return NotFound(new { Message = $"Animal record with ID {id} not found." });
                }

                // Map updated values
                existingAnimal.AgeUponOutcome = updatedAnimal.AgeUponOutcome;
                existingAnimal.AnimalId = updatedAnimal.AnimalId;
                existingAnimal.AnimalType = updatedAnimal.AnimalType;
                existingAnimal.Breed = updatedAnimal.Breed;
                existingAnimal.Color = updatedAnimal.Color;
                existingAnimal.DateOfBirth = updatedAnimal.DateOfBirth;
                existingAnimal.DateTime = updatedAnimal.DateTime;
                existingAnimal.MonthYear = updatedAnimal.MonthYear;
                existingAnimal.Name = updatedAnimal.Name;
                existingAnimal.OutcomeSubtype = updatedAnimal.OutcomeSubtype;
                existingAnimal.OutcomeType = updatedAnimal.OutcomeType;
                existingAnimal.SexUponOutcome = updatedAnimal.SexUponOutcome;
                existingAnimal.LocationLat = updatedAnimal.LocationLat;
                existingAnimal.LocationLong = updatedAnimal.LocationLong;
                existingAnimal.AgeUponOutcomeInWeeks = updatedAnimal.AgeUponOutcomeInWeeks;

                _context.SaveChanges();
                _logger.LogInformation($"Successfully updated animal record with ID: {id}");
                return Ok(existingAnimal);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Failed to update animal record with ID: {id}");
                return StatusCode(500, new { Error = "Persistence Failure", Message = ex.Message });
            }
        }

        [HttpDelete]
        [Route("animals/{id}")]
        public IActionResult DeleteAnimal(int id)
        {
            _logger.LogInformation($"Deleting animal record with ID: {id}");
            try
            {
                var animal = _context.Animals.Find(id);
                if (animal == null)
                {
                    _logger.LogWarning($"Delete failed: Animal record with ID {id} not found.");
                    return NotFound(new { Message = $"Animal record with ID {id} not found." });
                }

                _context.Animals.Remove(animal);
                _context.SaveChanges();
                
                _logger.LogInformation($"Successfully deleted animal record with ID: {id}");
                return Ok(new { Message = $"Animal record with ID {id} successfully deleted." });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Failed to delete animal record with ID: {id}");
                return StatusCode(500, new { Error = "Persistence Failure", Message = ex.Message });
            }
        }
    }
}
