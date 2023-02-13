local tabletProp = 0
local tabletModel = joaat("prop_cs_tablet")
local isOpen = false
local isDead = false

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
    for _, v in pairs(ESX.PlayerData.inventory) do
        if v.name == 'tablet' then
            return true
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
            data = ESX.PlayerData,
            name = ESX.PlayerData.firstName.." "..ESX.PlayerData.lastName,
        })
        isOpen = true
        Anim()
    else
        ESX.ShowNotification("You don't have a tablet?")
    end
end

--Command

RegisterCommand('tablet', function()
    if not isOpen then
        if not isDead and not IsPauseMenuActive() then
            OpenTablet()
        else
            ESX.ShowNotification("Action not available at the moment..")
        end
    end
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

AddEventHandler('esx:onPlayerDeath', function() isDead = true end)

AddEventHandler('esx:onPlayerSpawn', function(spawn) isDead = false end)

