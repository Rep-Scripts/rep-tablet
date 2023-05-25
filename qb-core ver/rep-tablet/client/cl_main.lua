Core = exports['qb-core']:GetCoreObject()
local tabletProp = 0
local tabletModel = joaat("prop_cs_tablet")
local isOpen = false

local function LoadAnimation(dict)
	RequestAnimDict(dict)
	while not HasAnimDictLoaded(dict) do
		Wait(1)
	end
end

local function deleteTablet()
	if tabletProp then
		DeleteObject(tabletProp)
		tabletProp = 0
	end
end

local function LoopAnim()
    CreateThread(function()
        local ped = PlayerPedId()
        while isOpen do
            if not IsEntityPlayingAnim(ped, 'amb@code_human_in_bus_passenger_idles@female@tablet@base', 'base', 3) then
                LoadAnimation('amb@code_human_in_bus_passenger_idles@female@tablet@base')
                TaskPlayAnim(ped, 'amb@code_human_in_bus_passenger_idles@female@tablet@base', 'base', 8.0, 8.0, -1, 50, 0, false, false, false)
            end
            Wait(1)
        end
        ClearPedTasks(ped)
    end)
end

local function Anim()
    deleteTablet()
    RequestModel(tabletModel)
	while not HasModelLoaded(tabletModel) do
		Wait(1)
	end
    local ped = PlayerPedId()
    local pos = GetEntityCoords(ped)
    tabletProp = CreateObject(tabletModel, pos.x, pos.y, pos.z, 1, 1, 0)
    AttachEntityToEntity(tabletProp, ped, GetPedBoneIndex(ped,  60309), 0.03, 0.002, -0.05, 10.0, 160.0, 0.0, 1, 1, 0, 1, 0, 1)
    SetModelAsNoLongerNeeded(tabletProp)
    SetEntityCompletelyDisableCollision(tabletProp, false, true)
    LoopAnim()
end

local function hasTablet()
    if PlayerData.items then
        for _, v in pairs(PlayerData.items) do
            if v.name == 'tablet' then
                return true
            end
        end
    end
end
exports('hasTablet', hasTablet)

RegisterNUICallback('HasTablet', function(_, cb)
    cb(hasTablet())
end)

local function CustomNotification(title, text, icon, color, timeout)
    SendNUIMessage({
        action = "CustomNotification",
        TabletNotify = {
            title = title or "Rep Scripts",
            text = text or "MSG",
            icon = icon or "fas fa-home",
            color = color or "#FFBF00",
            timeout = timeout or 1500,
        },
    })
end

exports("CustomNotification", CustomNotification)
---------NUI----------
---Bật Tablet
local function OpenTablet()
    if hasTablet() then
        SetNuiFocus(true, true)
        SendNUIMessage({
            action = "open",
            data = PlayerData,
            name = PlayerData.charinfo.firstname.." "..PlayerData.charinfo.lastname,
        })
        isOpen = true
        Anim()
    else
        Core.Functions.Notify("You don't have a tablet?", "error")
    end
end

--Command

RegisterNetEvent("OpenTabletRep", function()
    while not PlayerData do
        PlayerData = Core.Functions.GetPlayerData()
        Wait(100)
    end
    if not isOpen then
        if not PlayerData.metadata['ishandcuffed'] and not PlayerData.metadata['inlaststand'] and not PlayerData.metadata['isdead'] and not IsPauseMenuActive() then
            OpenTablet()
        else
            Core.Functions.Notify("Action not available at the moment..", "error")
        end
    end
end)

RegisterCommand('tablet', function()
	TriggerEvent('OpenTabletRep')
end)

RegisterKeyMapping('tablet', 'Open Tablet', 'keyboard', 'K')

---Nui-----
RegisterNUICallback('Close', function()
    SetNuiFocus(false, false)
    isOpen = false
    deleteTablet()
end)

-- Send a PhoneNotification to the tablet from anywhere
RegisterNetEvent("rep-tablet:client:CustomNotification", function(title, text, icon, color, timeout)
    CustomNotification(title, text, icon, color, timeout)
end)
