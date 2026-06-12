using System;

public class Animal
{
    public int Id { get; set; } // Mapped from CSV 'rec_num'
    public string? AgeUponOutcome { get; set; }
    public string? AnimalId { get; set; }
    public string? AnimalType { get; set; }
    public string? Breed { get; set; }
    public string? Color { get; set; }
    public DateTime? DateOfBirth { get; set; }
    public DateTime? DateTime { get; set; }
    public string? MonthYear { get; set; }
    public string? Name { get; set; }
    public string? OutcomeSubtype { get; set; }
    public string? OutcomeType { get; set; }
    public string? SexUponOutcome { get; set; }
    public double LocationLat { get; set; }
    public double LocationLong { get; set; }
    public double AgeUponOutcomeInWeeks { get; set; }
}