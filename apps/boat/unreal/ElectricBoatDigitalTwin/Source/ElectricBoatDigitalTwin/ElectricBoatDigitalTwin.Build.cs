using UnrealBuildTool;

public class ElectricBoatDigitalTwin : ModuleRules
{
    public ElectricBoatDigitalTwin(ReadOnlyTargetRules Target) : base(Target)
    {
        PCHUsage = PCHUsageMode.UseExplicitOrSharedPCHs;
        PublicDependencyModuleNames.AddRange(new[] {
            "Core", "CoreUObject", "Engine", "InputCore", "PhysicsCore", "Water"
        });
    }
}
