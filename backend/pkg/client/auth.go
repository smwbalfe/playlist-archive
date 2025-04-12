package client

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"
	"os"

	"github.com/smwbalfe/playlist-archive/backend/pkg/client/utils"
)

type Auth struct {
	AccessToken string
	ClientToken string
	Client      *http.Client
}

func NewAuth(httpClient *http.Client) *Auth {
	if httpClient == nil {
		httpClient = &http.Client{}
	}
	return &Auth{
		Client: httpClient,
	}
}

func (a *Auth) Initialize() error {
	a.AccessToken = os.Getenv("ACCESS_TOKEN")
	return nil
}

func (a *Auth) RefreshAccessToken() (string, error) {
	req, err := http.NewRequest("GET", fmt.Sprintf("%s/get_access_token", SpotifyRoot), nil)
	if err != nil {
		return "", fmt.Errorf("error creating request: %w", err)
	}
	utils.AddCookies(req)
	utils.AddHeaders(req)
	resp, err := utils.PerformRequest(req, a.Client)
	if err != nil {
		return "", fmt.Errorf("error performing request: %v", err)
	}
	var atResp AccessTokenResponse
	if err := json.Unmarshal(resp.Data, &atResp); err != nil {
		return "", fmt.Errorf("error unmarshalling JSON (body: %s): %w", string(resp.Data), err)
	}
	a.AccessToken = os.Getenv("ACCESS_TOKEN")
	return os.Getenv("CLIENT_ID"), nil
}

func (a *Auth) SetClientToken(clientID string) error {
	rootData := RootData{
		ClientData: ClientData{
			ClientVersion: "1.2.34.773.g9d8406e5",
			ClientID:      clientID,
			JsSDKData: JsSDKData{
				DeviceBrand: "",
				DeviceModel: "",
				OS:          "",
				OSVersion:   "",
				DeviceID:    "",
				DeviceType:  "",
			},
		},
	}

	jsonData, err := json.Marshal(rootData)
	if err != nil {
		return fmt.Errorf("error marshaling JSON data: %v", err)
	}

	req, err := http.NewRequest("POST", "https://clienttoken.spotify.com/v1/clienttoken", bytes.NewBuffer(jsonData))
	if err != nil {
		return fmt.Errorf("error creating request: %v", err)
	}

	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:124.0) Gecko/20100101 Firefox/124.0")
	req.Header.Set("Accept", "application/json")

	resp, err := utils.PerformRequest(req, a.Client)
	if err != nil {
		return fmt.Errorf("error performing request: %v", err)
	}

	var ctResp ClientTokenResponse
	if err := json.Unmarshal(resp.Data, &ctResp); err != nil {
		return fmt.Errorf("error unmarshalling JSON (body: %s): %w", string(resp.Data), err)
	}

	a.ClientToken = ctResp.GrantedToken.Token
	return nil
}

func (a *Auth) GetTokens() (string, string) {
	return a.AccessToken, a.ClientToken
}
