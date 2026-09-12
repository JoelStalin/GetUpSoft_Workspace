using UnrealBuildTool;
using System.Collections.Generic;

public class ElectricBoatDigitalTwinTarget : TargetRules
{
    public ElectricBoatDigitalTwinTarget(TargetInfo Target) : base(Target)
    {
        Type = TargetType.Game;
        DefaultBuildSettings = BuildSettingsVersion.Latest;
        ExtraModuleNames.Add("ElectricBoatDigitalTwin");
    }
}
