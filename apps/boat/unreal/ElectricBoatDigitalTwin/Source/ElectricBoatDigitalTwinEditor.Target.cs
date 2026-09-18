using UnrealBuildTool;
using System.Collections.Generic;

public class ElectricBoatDigitalTwinEditorTarget : TargetRules
{
    public ElectricBoatDigitalTwinEditorTarget(TargetInfo Target) : base(Target)
    {
        Type = TargetType.Editor;
        DefaultBuildSettings = BuildSettingsVersion.Latest;
        ExtraModuleNames.Add("ElectricBoatDigitalTwin");
    }
}
